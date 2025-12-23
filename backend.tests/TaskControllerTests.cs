using Xunit;
using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using backend.Data;
using backend.Models.Entities;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // HttpContext için gerekli
using System.Security.Claims;    // Kullanıcı taklidi (Claims) için gerekli
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

        // Test ortamında "Giriş Yapmış Kullanıcı"yı taklit eden yardımcı fonksiyon
        private TaskController CreateControllerWithUser(AppDbContext context, int userId)
        {
            // 1. Controller'ı oluştur (Configuration null olabilir, testte kullanmıyoruz)
            var controller = new TaskController(null, context);

            // 2. Sahte bir kullanıcı kimliği (Claim) oluştur
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()), // User ID
                new Claim(ClaimTypes.Role, "User")
            }, "mock"));

            // 3. Controller'ın içine bu sahte kullanıcıyı yerleştir
            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            return controller;
        }

        [Fact]
        public async Task GetTasks_ShouldReturnAllTasks()
        {
            // 1. Arrange (Hazırlık)
            var context = GetDatabaseContext();
            
            // Veritabanına test verisi ekleyelim (UserId: 1 olan kullanıcı için)
            context.MyTasks.Add(new MyTask { Title = "Test 1", Description = "Desc 1", Status = "todo", UserId = 1 });
            context.MyTasks.Add(new MyTask { Title = "Test 2", Description = "Desc 2", Status = "completed", UserId = 1 });
            // Başka bir kullanıcının görevi (Bu gelmemeli)
            context.MyTasks.Add(new MyTask { Title = "Başkası", Description = "Desc 3", Status = "todo", UserId = 99 });
            
            await context.SaveChangesAsync();

            // Controller'ı UserId: 1 ile ayağa kaldır
            var controller = CreateControllerWithUser(context, 1);

            // 2. Act (Eylem) -> İsmi TaskList olarak düzelttim
            var result = await controller.TaskList();

            // 3. Assert (Kontrol)
            var actionResult = Assert.IsType<OkObjectResult>(result);
            var returnedTasks = Assert.IsAssignableFrom<IEnumerable<MyTask>>(actionResult.Value);
            
            // Sadece UserId: 1 olan 2 görev gelmeli
            Assert.Equal(2, returnedTasks.Count());
        }

        [Fact]
        public async Task CreateTask_ShouldAddNewTask()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = CreateControllerWithUser(context, 1); // UserId: 1
            
            var newTaskDto = new TaskCreateDto 
            { 
                Title = "Yeni Görev", 
                Description = "Deneme Açıklama",
                Category = "Work",
                DueDate = DateTime.Now.AddDays(1),
                DueTime = "14:00" // String olarak saat
            };

            // 2. Act -> İsmi AddTask olarak düzelttim
            var result = await controller.AddTask(newTaskDto);

            // 3. Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result);
            
            // Veritabanına eklenmiş mi?
            var taskInDb = await context.MyTasks.FirstOrDefaultAsync(t => t.Title == "Yeni Görev");
            Assert.NotNull(taskInDb);
            Assert.Equal(1, taskInDb.UserId); // Doğru kullanıcıya mı eklenmiş?
        }
    }
}