using Xunit;
using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using backend.Data;
using backend.Models.Entities;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace backend.tests
{
    public class UserControllerTests
    {
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var databaseContext = new AppDbContext(options);
            databaseContext.Database.EnsureCreated();
            return databaseContext;
        }

        private IConfiguration GetConfiguration()
        {
            var myConfiguration = new Dictionary<string, string?>
            {
                // Uzun anahtar (512 bit uyumlu)
                {"Jwt:Key", "bu_test_icin_cok_gizli_ve_uzun_bir_anahtardir_en_az_64_karakter_olmali_ki_512_bit_olsun_ve_hata_vermesin"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
        }

        [Fact]
        public async Task Register_ShouldCreateNewUser()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var config = GetConfiguration();
            var controller = new UserController(context, config);

            var registerDto = new UserRegisterDto
            {
                FullName = "Test User",
                Username = "testuser",
                Email = "test@example.com",
                Password = "password123"
            };

            // 2. Act
            var result = await controller.Register(registerDto);

            // 3. Assert - DÜZELTME:
            // IsAssignableFrom kullanarak hem ObjectResult hem de OkObjectResult/CreatedResult kabul ediyoruz.
            var actionResult = Assert.IsAssignableFrom<ObjectResult>(result);
            
            // Senin kodun 201 (Created) dönüyor, testi buna göre güncelledik.
            Assert.Equal(201, actionResult.StatusCode); 
            
            var message = actionResult.Value?.GetType().GetProperty("message")?.GetValue(actionResult.Value);
            Assert.NotNull(message);
            
            var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
            Assert.NotNull(userInDb);
        }

        [Fact]
        public async Task Login_ShouldReturnToken_WhenCredentialsAreCorrect()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var config = GetConfiguration();
            var controller = new UserController(context, config);

            await controller.Register(new UserRegisterDto 
            { 
                FullName = "Login User", 
                Username = "loginuser", 
                Email = "login@test.com", 
                Password = "password123" 
            });

            var loginDto = new UserLoginDto
            {
                Username = "loginuser", 
                Password = "password123"
            };

            // 2. Act
            var result = await controller.Login(loginDto);

            // 3. Assert - DÜZELTME:
            // Burası "OkObjectResult" dönüyor, doğrudan bunu kontrol ediyoruz.
            var actionResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, actionResult.StatusCode);

            var token = actionResult.Value?.GetType().GetProperty("token")?.GetValue(actionResult.Value);
            Assert.NotNull(token);
        }

        [Fact]
        public async Task Login_ShouldFail_WhenPasswordIsWrong()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var config = GetConfiguration();
            var controller = new UserController(context, config);

            await controller.Register(new UserRegisterDto 
            { 
                FullName = "Wrong Pass", 
                Username = "wrongpass", 
                Email = "wrong@test.com", 
                Password = "correctpassword" 
            });

            var loginDto = new UserLoginDto
            {
                Username = "wrongpass",
                Password = "WRONG_PASSWORD" 
            };

            // 2. Act
            var result = await controller.Login(loginDto);

            // 3. Assert
            // 401 Unauthorized kontrolü
            var actionResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, actionResult.StatusCode);
        }
    }
}