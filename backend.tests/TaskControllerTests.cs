using Xunit;
using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using backend.Data;
using backend.Models.Entities;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace backend.tests
{
    public class TaskControllerTests
    {
        // Testler için sahte veritabanı hazırlayıcı
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();
            
            return databaseContext;
        }

        // Giriş yapmış kullanıcıyı taklit eden yardımcı metot
        private TaskController CreateControllerWithUser(AppDbContext context, int userId)
        {
            var controller = new TaskController(null, context); // Configuration null olabilir (Task için gerekmiyor)
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "User")
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
            return controller;
        }

        [Fact]
        public async Task GetTasks_ShouldReturnAllTasks()
        {
            var context = GetDatabaseContext();
            context.MyTasks.Add(new MyTask { Title = "Task 1", Status = "todo", UserId = 1 });
            context.MyTasks.Add(new MyTask { Title = "Task 2", Status = "completed", UserId = 1 });
            context.MyTasks.Add(new MyTask { Title = "Other User Task", UserId = 99 }); // Gelmemeli
            await context.SaveChangesAsync();

            var controller = CreateControllerWithUser(context, 1);
            var result = await controller.TaskList();

            var actionResult = Assert.IsType<OkObjectResult>(result);
            var returnedTasks = Assert.IsAssignableFrom<IEnumerable<MyTask>>(actionResult.Value);
            Assert.Equal(2, returnedTasks.Count());
        }

        [Fact]
        public async Task CreateTask_ShouldAddNewTask()
        {
            var context = GetDatabaseContext();
            var controller = CreateControllerWithUser(context, 1);
            
            var newTaskDto = new TaskCreateDto 
            { 
                Title = "Yeni Görev", 
                Description = "Açıklama", 
                Category = "Work",
                DueDate = DateTime.Now.AddDays(1),
                DueTime = "14:00"
            };

            var result = await controller.AddTask(newTaskDto);

            var actionResult = Assert.IsType<CreatedAtActionResult>(result);
            var taskInDb = await context.MyTasks.FirstOrDefaultAsync(t => t.Title == "Yeni Görev");
            Assert.NotNull(taskInDb);
            Assert.Equal(1, taskInDb.UserId);
        }

        // --- EKLENEN YENİ TESTLER ---

        [Fact]
        public async Task EditTasks_ShouldUpdateExistingTask()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            // Düzenlenecek görevi ekle
            var existingTask = new MyTask { Title = "Eski Başlık", Description = "Eski Açıklama", UserId = 1 };
            context.MyTasks.Add(existingTask);
            await context.SaveChangesAsync();

            var controller = CreateControllerWithUser(context, 1);
            
            var updateDto = new TaskUpdateDto 
            { 
                Title = "Yeni Başlık", // Değişecek
                Description = "Yeni Açıklama", // Değişecek
                Status = "in-progress" 
            };

            // 2. Act
            var result = await controller.EditTasks(existingTask.Id, updateDto);

            // 3. Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            var updatedTask = await context.MyTasks.FindAsync(existingTask.Id);
            
            Assert.Equal("Yeni Başlık", updatedTask.Title);
            Assert.Equal("Yeni Açıklama", updatedTask.Description);
        }

        [Fact]
        public async Task DeleteTasks_ShouldRemoveTask()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var taskToDelete = new MyTask { Title = "Silinecek", UserId = 1 };
            context.MyTasks.Add(taskToDelete);
            await context.SaveChangesAsync();

            var controller = CreateControllerWithUser(context, 1);

            // 2. Act
            var result = await controller.DeleteTasks(taskToDelete.Id);

            // 3. Assert
            Assert.IsType<NoContentResult>(result); // 204 No Content dönmeli
            
            var deletedTask = await context.MyTasks.FindAsync(taskToDelete.Id);
            Assert.Null(deletedTask); // Veritabanında artık olmamalı
        }

        [Fact]
        public async Task GetTasksByStatus_ShouldFilterTasks()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            context.MyTasks.Add(new MyTask { Title = "T1", Status = "todo", UserId = 1 });
            context.MyTasks.Add(new MyTask { Title = "T2", Status = "todo", UserId = 1 });
            context.MyTasks.Add(new MyTask { Title = "T3", Status = "completed", UserId = 1 });
            await context.SaveChangesAsync();

            var controller = CreateControllerWithUser(context, 1);

            // 2. Act (Sadece 'todo' olanları iste)
            var result = await controller.GetTasksByStatus("todo");

            // 3. Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            
            // Dönen obje anonim tip olduğu için Reflection veya dynamic ile kontrol edelim
            var value = actionResult.Value;
            var tasksProperty = value.GetType().GetProperty("Tasks");
            var tasksValue = tasksProperty.GetValue(value) as IEnumerable<MyTask>;

            Assert.Equal(2, tasksValue.Count()); // 2 tane 'todo' olmalı
        }

        [Fact]
        public async Task GetStats_ShouldReturnCorrectCounts()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            // 1 Tamamlanmış
            context.MyTasks.Add(new MyTask { Title = "Done", Status = "completed", UserId = 1 });
            // 1 Gecikmiş (Tarihi dünden kalan)
            context.MyTasks.Add(new MyTask { Title = "Late", Status = "todo", DueDate = DateTime.Now.AddDays(-1), UserId = 1 });
            // 1 Bekleyen (Yarına)
            context.MyTasks.Add(new MyTask { Title = "Pending", Status = "todo", DueDate = DateTime.Now.AddDays(1), UserId = 1 });
            
            await context.SaveChangesAsync();

            var controller = CreateControllerWithUser(context, 1);

            // 2. Act
            var result = await controller.GetStats();

            // 3. Assert
            var actionResult = Assert.IsType<OkObjectResult>(result);
            
            // JSON dönüşünü kontrol et { Total: 3, Done: 1, Pending: 1, Overdue: 1 }
            dynamic data = actionResult.Value;
            
            // Dynamic object property okuma (anonim tipler testte bazen trick gerektirir ama bu genelde çalışır)
            // Eğer hata alırsan property'leri reflection ile okuyabiliriz
            Assert.Equal(3, (int)data.GetType().GetProperty("Total").GetValue(data));
            Assert.Equal(1, (int)data.GetType().GetProperty("Done").GetValue(data));
            Assert.Equal(1, (int)data.GetType().GetProperty("Overdue").GetValue(data));
        }
    }
}