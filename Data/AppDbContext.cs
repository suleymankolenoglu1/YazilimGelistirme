using Microsoft.EntityFrameworkCore;
using backend.Models.Entities;


namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<MyTask> MyTasks { get; set; }

        // VeriTabanını ayarlayacak arkadaş ConnectionStrings bağlantısını da hallediversin bi zahmet
        // VeriTabanını Program.cse de tanımlamayı unutmasın 






    }
    
}