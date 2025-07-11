using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace pump_api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public byte[] PasswordHash { get; set; } = new byte[0];
        public byte[] PasswordSalt { get; set; } = new byte[0];
        public UserRole Role { get; set; } = UserRole.FarmManager;

        // Navigation properties for the Pump Master application
        public List<Pump> Pumps { get; set; } = new List<Pump>();
        public List<PumpInspection> Inspections { get; set; } = new List<PumpInspection>();
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}