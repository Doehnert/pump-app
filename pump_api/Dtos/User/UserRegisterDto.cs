using System.ComponentModel.DataAnnotations;

namespace pump_api.Dtos.User
{
    public class UserRegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores")]
        public string username { get; set; } = string.Empty;

        [Required]
        [StringLength(128, MinimumLength = 8)]
        public string password { get; set; } = string.Empty;
    }
}