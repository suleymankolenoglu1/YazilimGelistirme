

namespace backend.Models.DTOs
{
   public class TaskUpdateDto
    {
         public string? Title { get; set; } 
         public string? Description { get; set; }
         public string? Category { get; set; }
         public string? Status { get; set; }
         public DateTime? DueDate { get; set; }
         public TimeSpan? DueTime { get; set; }
    
    }
}