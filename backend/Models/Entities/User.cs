namespace backend.Models.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "User"; // Default role
        public string Email { get; set; } = "";
        public string PasswordHash { get; set; } = "";  // byte[] → string
        public string PasswordSalt { get; set; } = "";  // byte[] → string
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}