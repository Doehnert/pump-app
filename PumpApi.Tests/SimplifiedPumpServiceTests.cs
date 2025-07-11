using pump_api.Dtos.Pump;
using pump_api.Models;
using pump_api.Services.PumpService;
using Xunit;

namespace pump_api.Tests
{
  public class SimplifiedPumpServiceTests
  {
    [Fact]
    public async Task GetAllPumps_ShouldReturnPumpsForUser()
    {
      // Arrange - Much simpler with helpers!
      var context = TestHelpers.CreateInMemoryContext();
      var user = await TestHelpers.CreateTestUser(context, 1, UserRole.Admin);
      await TestHelpers.CreateTestPumps(context, 1, 2, 1); // 2 pumps for user 1, starting at ID 1
      await TestHelpers.CreateTestPumps(context, 2, 1, 3); // 1 pump for user 2, starting at ID 3

      var pumpService = TestHelpers.CreatePumpService(context);

      // Act
      var parameters = new QueryParameters
      {
        PageNumber = 1,
        PageSize = 10,
        Search = "",
        SortBy = "",
        SortDirection = "asc"
      };
      var result = await pumpService.GetAllPumps(1, parameters);

      // Assert
      Assert.True(result.Success);
      Assert.Equal(3, result.Data.Data.Count); // Admin sees all pumps
    }

    [Fact]
    public async Task AddPump_ValidPump_ShouldAddToDatabase()
    {
      // Arrange
      var context = TestHelpers.CreateInMemoryContext();
      var user = await TestHelpers.CreateTestUser(context);
      var pumpService = TestHelpers.CreatePumpService(context);

      var addPumpDto = new AddPumpDto
      {
        Name = "New Pump",
        Type = PumpType.Centrifugal,
        Area = "North",
        Latitude = 1.0,
        Longitude = 1.0,
        FlowRate = 100,
        Offset = 0,
        CurrentPressure = 2.5,
        MinPressure = 2.0,
        MaxPressure = 3.0
      };

      // Act
      var result = await pumpService.AddPump(addPumpDto, 1);

      // Assert
      Assert.True(result.Success);
      Assert.Contains(result.Data, dto => dto.Name == "New Pump");
    }

    [Fact]
    public async Task GetPumpById_ExistingPump_ShouldReturnPump()
    {
      // Arrange
      var context = TestHelpers.CreateInMemoryContext();
      var user = await TestHelpers.CreateTestUser(context);
      var pumps = await TestHelpers.CreateTestPumps(context);
      var pumpService = TestHelpers.CreatePumpService(context);

      // Act
      var result = await pumpService.GetPumpById(1);

      // Assert
      Assert.True(result.Success);
      Assert.Equal("Pump 1", result.Data.Name);
    }

    [Fact]
    public async Task GetPumpById_NonExistentPump_ShouldReturnFailure()
    {
      // Arrange
      var context = TestHelpers.CreateInMemoryContext();
      var pumpService = TestHelpers.CreatePumpService(context);

      // Act
      var result = await pumpService.GetPumpById(999);

      // Assert
      Assert.False(result.Success);
      Assert.Equal("Pump not found", result.Message);
    }
  }
}