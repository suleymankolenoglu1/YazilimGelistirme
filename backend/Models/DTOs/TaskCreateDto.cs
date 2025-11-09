using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs
{
    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public DateTime DueDate { get; set; }
        
        [Required]
        public string DueTime { get; set; } = "12:00"; // Default saat 12:00 olarak ayarlandı
    }
}