using backend.Data;
using backend.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.StaticFiles;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Güvenlik gereği tüm endpointler yetki gerektirir
    public class AttachmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttachmentController(AppDbContext context)
        {
            _context = context;
        }

        #region Helper Methods (Yardımcı Metotlar)
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Kullanıcı kimliği doğrulanamadı.");
            }
            return userId;
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
        }
        #endregion

        //Dosya Yükleme (POST: api/attachment/tasks/{id})
        [HttpPost("tasks/{id}")]
        public async Task<IActionResult> UploadFile(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetUserRole();

            var task = await _context.MyTasks.FirstOrDefaultAsync(t => t.Id == id);
            
            // Yetki Kontrolü: Admin her şeye, User sadece kendi görevine yükleyebilir
            if (task == null || (currentUserRole != "Admin" && task.UserId != currentUserId))
            {
                return Forbid("Bu göreve dosya yükleme yetkiniz yok.");
            }

            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0) return BadRequest("Yüklenecek dosya seçilmedi.");

            // Kısıtlama: Maksimum 10 MB
            if (file.Length > 10 * 1024 * 1024) return BadRequest("Dosya boyutu 10MB'ı geçemez.");

            // Kısıtlama: Desteklenen formatlar
            var allowedExtensions = new[] { ".pdf", ".png", ".jpg", ".docx", ".xlsx" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension)) return BadRequest("Sadece PDF, PNG, JPG, DOCX ve XLSX formatları desteklenir.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Metadata Kaydı (Final raporu ve puanlama için zorunlu alanlar)
            var attachment = new Attachment
            {
                MyTaskId = id,
                OriginalFileName = file.FileName,
                StoragePath = $"/uploads/{fileName}",
                FileSize = file.Length,
                UploadDate = DateTime.Now,
                UploaderUserId = currentUserId
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }

        // 2. Dosyaları Listeleme (GET: api/attachment/tasks/{id})
        [HttpGet("tasks/{id}")]
        public async Task<IActionResult> ListAttachments(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetUserRole();

            var task = await _context.MyTasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null || (currentUserRole != "Admin" && task.UserId != currentUserId))
            {
                return Forbid("Bu görevin eklerini görme yetkiniz yok.");
            }

            var attachments = await _context.Attachments
                .Where(a => a.MyTaskId == id)
                .Select(a => new
                {
                    a.Id,
                    a.OriginalFileName,
                    // Boyutu MB cinsinden formatlayarak gönderiyoruz
                    FileSizeFormatted = (a.FileSize / 1024.0 / 1024.0).ToString("F2") + " MB",
                    a.UploadDate,
                    a.UploaderUserId
                })
                .ToListAsync();

            return Ok(attachments);
        }

        //Dosya İndirme ve Önizleme (GET: api/attachment/{id})
        [HttpGet("{id}")]
        public async Task<IActionResult> DownloadAttachment(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetUserRole();

            var attachment = await _context.Attachments.FirstOrDefaultAsync(a => a.Id == id);
            if (attachment == null) return NotFound("Dosya kaydı bulunamadı.");

            var task = await _context.MyTasks.FirstOrDefaultAsync(t => t.Id == attachment.MyTaskId);
            if (task == null || (currentUserRole != "Admin" && task.UserId != currentUserId))
            {
                return Forbid("Bu dosyaya erişim yetkiniz yok.");
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachment.StoragePath.TrimStart('/'));
            if (!System.IO.File.Exists(filePath)) return NotFound("Fiziksel dosya sunucuda bulunamadı.");

            // Tarayıcıda önizleme (Preview) yapılabilmesi için içerik tipini belirliyoruz
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(attachment.OriginalFileName, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(bytes, contentType, attachment.OriginalFileName);
        }

        //Dosya Silme (DELETE: api/attachment/{id})
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttachment(int id)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetUserRole();

            var attachment = await _context.Attachments.FirstOrDefaultAsync(a => a.Id == id);
            if (attachment == null) return NotFound("Silinecek dosya bulunamadı.");

            var task = await _context.MyTasks.FirstOrDefaultAsync(t => t.Id == attachment.MyTaskId);
            if (task == null || (currentUserRole != "Admin" && task.UserId != currentUserId))
            {
                return Forbid("Bu dosyayı silme yetkiniz yok.");
            }

            try
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachment.StoragePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                _context.Attachments.Remove(attachment);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Silme işlemi sırasında bir hata oluştu: {ex.Message}");
            }
        }

        //Kategori Bazlı Görev İstatistikleri (GET: api/attachment/stats)
        [HttpGet("stats")]
        public async Task<IActionResult> GetTaskStats()
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetUserRole();

            var query = _context.MyTasks.AsQueryable();
            
            // Admin ise tüm sistem, User ise sadece kendi istatistikleri
            if (currentUserRole != "Admin")
            {
                query = query.Where(t => t.UserId == currentUserId);
            }

            var tasks = await query.ToListAsync();
            var now = DateTime.Now.Date;

            var stats = tasks
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Completed = g.Count(t => t.Status.ToLower() == "completed"),
                    Pending = g.Count(t => t.Status.ToLower() != "completed" && t.DueDate.Date >= now),
                    Overdue = g.Count(t => t.Status.ToLower() != "completed" && t.DueDate.Date < now),
                    Total = g.Count()
                })
                .ToList();

            return Ok(stats);
        }
    }
}