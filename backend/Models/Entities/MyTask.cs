
namespace backend.Models.Entities
{
    // Kısa bir not: Normalde dosyanın ismini Task.cs yapıcaktım ama AppDbContexte tanımlarken
    // DbSet<Task> dediğimde C# System threadingsinde kullandığı Task ile karıştığı için 
    // Bu dosyanın ismini MyTask yaptım

    public class MyTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public string Status { get; set; } = "todo";  // Default value
        public DateTime DueDate { get; set; }
        public TimeSpan DueTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? LastModified { get; set; }
        public int UserId { get; set; }
        
        // Navigation property (opsiyonel ama önerilen)
        public User? User { get; set; }

    }
}