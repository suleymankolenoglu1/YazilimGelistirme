

namespace backend.Models.DTOs
{
    public class TaskCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime DueDate { get; set; } // Tarih ve Saat bilgisi isteyeceğiz
        public TimeSpan DueTime { get; set; }
    }
}