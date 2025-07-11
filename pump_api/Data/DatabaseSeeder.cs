using pump_api.Models;
using System.Security.Cryptography;
using System.Text;
using Bogus;

namespace pump_api.Data
{
  public static class DatabaseSeeder
  {
    public static async Task SeedDataAsync(DataContext context)
    {
      await SeedUsersAsync(context);
      await context.SaveChangesAsync();

      await SeedPumpsAsync(context);
      await context.SaveChangesAsync();

      await SeedPumpInspectionsAsync(context);
      await context.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(DataContext context)
    {
      if (context.Users.Any())
        return;

      var users = new List<User>();

      // Create admin user as specified in README
      var adminUser = new User
      {
        Username = "admin",
        Role = UserRole.Admin
      };
      CreatePasswordHash("admin123", out byte[] adminPasswordHash, out byte[] adminPasswordSalt);
      adminUser.PasswordHash = adminPasswordHash;
      adminUser.PasswordSalt = adminPasswordSalt;
      users.Add(adminUser);

      // Create additional sample users
      for (int i = 0; i < 9; i++)
      {
        var user = new User
        {
          Username = $"user{i + 1}",
          Role = (UserRole)((i % 4) + 1) // Cycle through Admin, FarmManager, Technician, Inspector
        };

        CreatePasswordHash("password", out byte[] passwordHash, out byte[] passwordSalt);
        user.PasswordHash = passwordHash;
        user.PasswordSalt = passwordSalt;

        users.Add(user);
      }

      await context.Users.AddRangeAsync(users);
    }

    private static async Task SeedPumpsAsync(DataContext context)
    {
      if (context.Pumps.Any())
        return;

      var users = await context.Users.ToListAsync();
      if (!users.Any()) return;

      var areaNames = new[] { "North Field", "South Field", "East Field", "West Field", "Central Field" };
      var pumpFaker = new Faker<Pump>()
          .RuleFor(p => p.Name, f => $"{f.Commerce.ProductAdjective()} {f.Commerce.Product()} Pump")
          .RuleFor(p => p.Type, f => f.PickRandom<PumpType>())
          .RuleFor(p => p.Area, f => f.PickRandom(areaNames))
          .RuleFor(p => p.Latitude, f => f.Address.Latitude(-27.5, -27.3))
          .RuleFor(p => p.Longitude, f => f.Address.Longitude(153.0, 153.2))
          .RuleFor(p => p.FlowRate, f => f.Random.Double(80, 250))
          .RuleFor(p => p.Offset, f => f.Random.Double(0, 10))
          .RuleFor(p => p.CurrentPressure, f => f.Random.Double(2.0, 4.0))
          .RuleFor(p => p.MinPressure, f => f.Random.Double(1.5, 2.5))
          .RuleFor(p => p.MaxPressure, f => f.Random.Double(3.0, 5.0));

      var pumps = new List<Pump>();
      foreach (var user in users)
      {
        // Each user gets 3 pumps
        var userPumps = pumpFaker.Clone()
            .RuleFor(p => p.UserId, _ => user.Id)
            .Generate(3);
        pumps.AddRange(userPumps);
      }

      await context.Pumps.AddRangeAsync(pumps);
    }

    private static async Task SeedPumpInspectionsAsync(DataContext context)
    {
      if (context.PumpInspections.Any())
        return;

      var pumps = await context.Pumps.ToListAsync();
      var technicians = await context.Users.Where(u => u.Role == UserRole.Technician).ToListAsync();
      if (!technicians.Any()) return;

      var inspections = new List<PumpInspection>();
      var random = new Random();

      foreach (var pump in pumps)
      {
        var inspectionCount = random.Next(2, 5);
        for (int i = 0; i < inspectionCount; i++)
        {
          var inspection = new PumpInspection
          {
            PumpId = pump.Id,
            InspectorId = technicians[random.Next(technicians.Count)].Id,
            InspectionDate = DateTime.Now.AddDays(-random.Next(1, 30)),
            Status = (InspectionStatus)random.Next(0, 3),
            Notes = $"Inspection {i + 1} for {pump.Name}. All systems operational.",
            PressureReading = pump.CurrentPressure + (random.NextDouble() - 0.5) * 0.5,
            FlowRateReading = pump.FlowRate + (random.NextDouble() - 0.5) * 10,
            IsOperational = true
          };
          inspections.Add(inspection);
        }
      }
      await context.PumpInspections.AddRangeAsync(inspections);
    }

    private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
      using (var hmac = new HMACSHA512())
      {
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
      }
    }

    public static async Task ClearAllDataAsync(DataContext context)
    {
      context.PumpInspections.RemoveRange(context.PumpInspections);
      context.Pumps.RemoveRange(context.Pumps);
      context.Users.RemoveRange(context.Users);
      await context.SaveChangesAsync();
    }

    public static async Task SeedUsersOnlyAsync(DataContext context)
    {
      await SeedUsersAsync(context);
      await context.SaveChangesAsync();
    }

    public static async Task SeedPumpsOnlyAsync(DataContext context)
    {
      await SeedPumpsAsync(context);
      await context.SaveChangesAsync();
    }
  }
}