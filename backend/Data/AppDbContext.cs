using Microsoft.EntityFrameworkCore;
using backend.Models.Entities;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            // PostgreSQL için timezone ayarı
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<MyTask> MyTasks { get; set; }
        public DbSet<Attachment> Attachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Users tablosu yapılandırması
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.FullName).HasColumnName("full_name").IsRequired();
                entity.Property(e => e.Username).HasColumnName("username").IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").IsRequired();
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash").IsRequired();
                entity.Property(e => e.PasswordSalt).HasColumnName("password_salt").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");

                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // Tasks tablosu yapılandırması
            modelBuilder.Entity<MyTask>(entity =>
            {
                entity.ToTable("tasks");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Title).HasColumnName("title").IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Category).HasColumnName("category").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("todo");
                entity.Property(e => e.DueDate).HasColumnName("due_date");
                entity.Property(e => e.DueTime).HasColumnName("due_time");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.LastModified).HasColumnName("last_modified");
                entity.Property(e => e.UserId).HasColumnName("user_id");

                // Foreign Key relationship
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Indexes
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.DueDate);
            });
        }
    }
}