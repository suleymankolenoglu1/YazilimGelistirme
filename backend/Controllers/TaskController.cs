using backend.Data;
using backend.Models.Entities;  // ProjectTask modelinin yeni namespace'i
using backend.Models.DTOs;     // Task DTO'larının yeni namespace'i
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.StaticFiles;

namespace backend.Controllers
{
    
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public TaskController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value;
        }

        

       

        
        private int GetCurrentUserId()
        {
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                
                throw new UnauthorizedAccessException("Geçerli kullanıcı ID'si token'da bulunamadı.");
            }
            return userId;
        }

        

        
        

        

        
        

        
        [HttpGet("tasks")]
        public async Task<IActionResult> TaskList()
        {
            var currentUserId = GetCurrentUserId();
            
            // Sadece oturum açmış kullanıcıya ait görevleri getir ve CreatedAt'a göre sırala
            var tasks = await _context.MyTasks 
                                      .Where(t => t.UserId == currentUserId)
                                      .OrderByDescending(t => t.CreatedAt)
                                      .ToListAsync();
                                      
            if (tasks == null || !tasks.Any())
            {
                return Ok(new List<MyTask>()); // Boş liste döndür
            }

            return Ok(tasks);
        }

        
        [HttpPost("tasks")]
public async Task<IActionResult> AddTask([FromBody] TaskCreateDto request)
{
    var currentUserId = GetCurrentUserId();

    // DueTime string'i TimeSpan'e çevirme
    if (!TimeSpan.TryParse(request.DueTime, out TimeSpan dueTime))
    {
        return BadRequest("Geçersiz saat formatı. Lütfen HH:mm formatında giriniz.");
    }

    var newTask = new MyTask
    {
        Title = request.Title,
        Description = request.Description,
        Category = request.Category, 
        Status = "todo", 
        DueDate = request.DueDate,
        DueTime = dueTime, // Çevrilen TimeSpan değerini kullan
        CreatedAt = DateTime.Now,
        UserId = currentUserId 
    };

    _context.MyTasks.Add(newTask);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(TaskList), new { id = newTask.Id }, newTask);
}

        
        [HttpPut("tasks/{id}")]
        public async Task<IActionResult> EditTasks(int id, [FromBody] TaskUpdateDto request)
        {
            var currentUserId = GetCurrentUserId();

            // Görevi ID ve Kullanıcı ID'si ile bul
            var taskToUpdate = await _context.MyTasks
                                             .FirstOrDefaultAsync(t => t.Id == id && t.UserId == currentUserId);

            if (taskToUpdate == null)
            {
                return NotFound("Görev bulunamadı veya bu görevi düzenleme yetkiniz yok.");
            }

            
            taskToUpdate.Title = request.Title ?? taskToUpdate.Title;
            taskToUpdate.Description = request.Description ?? taskToUpdate.Description;
            taskToUpdate.Category = request.Category ?? taskToUpdate.Category;
            taskToUpdate.Status = request.Status ?? taskToUpdate.Status;

            
            if (request.DueDate.HasValue)
            {
                taskToUpdate.DueDate = request.DueDate.Value;
            }
            if (request.DueTime.HasValue)
            {
                taskToUpdate.DueTime = request.DueTime.Value;
            }
            
            taskToUpdate.LastModified = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(taskToUpdate);
        }

        
        [HttpDelete("tasks/{id}")]
        public async Task<IActionResult> DeleteTasks(int id)
        {
            var currentUserId = GetCurrentUserId();

            var taskToDelete = await _context.MyTasks
                                             .FirstOrDefaultAsync(t => t.Id == id && t.UserId == currentUserId);

            if (taskToDelete == null)
            {
                return NotFound("Görev bulunamadı veya bu görevi silme yetkiniz yok.");
            }

            _context.MyTasks.Remove(taskToDelete);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content (Başarılı silme kodu)
        }

       
        [HttpGet("tasks/{status}")]
        public async Task<IActionResult> GetTasksByStatus(string status)
        {
            var currentUserId = GetCurrentUserId();

            // Kullanıcının, belirtilen statüdeki görevlerini getir
            var tasksByStatus = await _context.MyTasks
                                               .Where(t => t.UserId == currentUserId && t.Status.ToLower() == status.ToLower())
                                               .ToListAsync();

            if (tasksByStatus == null || !tasksByStatus.Any())
            {
                return NotFound($"Bu statüde ({status}) görev bulunamadı.");
            }
            
            return Ok(new 
            {
                Status = status,
                Count = tasksByStatus.Count,
                Tasks = tasksByStatus
            });
       
    }
    // GET /api/Task/tasks/stats
[HttpGet("tasks/stats")]
public async Task<IActionResult> GetStats()
{
    var currentUserId = GetCurrentUserId();

    var allTasks = await _context.MyTasks
                                  .Where(t => t.UserId == currentUserId)
                                  .ToListAsync();

    var total = allTasks.Count;
    var done = allTasks.Count(t => t.Status.ToLower() == "completed");
    var pending = allTasks.Count(t => t.Status.ToLower() == "todo");
    var inProgress = allTasks.Count(t => t.Status.ToLower() == "in-progress");

    // Kategorilere göre dağılım
    var byCategory = allTasks
        .GroupBy(t => t.Category)
        .Select(g => new
        {
            Category = g.Key,
            Total = g.Count(),
            Done = g.Count(t => t.Status.ToLower() == "completed"),
            Pending = g.Count(t => t.Status.ToLower() == "todo"),
            InProgress = g.Count(t => t.Status.ToLower() == "in-progress")
        })
        .ToList();

    return Ok(new
    {
        Total = total,
        Done = done,
        Pending = pending,
        InProgress = inProgress,
        ByCategory = byCategory
    });
}
}
}