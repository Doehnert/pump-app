using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using pump_api.Data;
using pump_api.Dtos.Pump;
using pump_api.Models;
using pump_api.Services;
using pump_api.Services.PumpService;

namespace pump_api.Tests
{
  public static class TestHelpers
  {
    public static DataContext CreateInMemoryContext()
    {
      var options = new DbContextOptionsBuilder<DataContext>()
          .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
          .Options;
      return new DataContext(options);
    }

    public static Mock<IMapper> CreateMockMapper()
    {
      var mockMapper = new Mock<IMapper>();

      // Setup common mappings
      mockMapper.Setup(m => m.Map<GetPumpDto>(It.IsAny<Pump>()))
          .Returns<Pump>(p => new GetPumpDto
          {
            Id = p.Id,
            Name = p.Name,
            Type = p.Type,
            Area = p.Area,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            FlowRate = p.FlowRate,
            Offset = p.Offset,
            CurrentPressure = p.CurrentPressure,
            MinPressure = p.MinPressure,
            MaxPressure = p.MaxPressure,
            UserId = p.UserId,
            LastUpdated = p.LastUpdated
          });

      mockMapper.Setup(m => m.Map<Pump>(It.IsAny<AddPumpDto>()))
          .Returns<AddPumpDto>(dto => new Pump
          {
            Name = dto.Name,
            Type = dto.Type,
            Area = dto.Area,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            FlowRate = dto.FlowRate,
            Offset = dto.Offset,
            CurrentPressure = dto.CurrentPressure,
            MinPressure = dto.MinPressure,
            MaxPressure = dto.MaxPressure
          });

      return mockMapper;
    }

    public static Mock<IQueryBuilderService> CreateMockQueryBuilder()
    {
      var mockQueryBuilder = new Mock<IQueryBuilderService>();

      mockQueryBuilder.Setup(x => x.GetPagedResultAsync(
          It.IsAny<IQueryable<Pump>>(),
          It.IsAny<QueryParameters>(),
          It.IsAny<Dictionary<string, string>>(),
          It.IsAny<Dictionary<string, string>>()))
          .ReturnsAsync((IQueryable<Pump> query, QueryParameters parameters, Dictionary<string, string> sortFields, Dictionary<string, string> filterFields) =>
          {
            var totalCount = query.Count();

            // Apply search if specified
            if (!string.IsNullOrEmpty(parameters.Search))
            {
              query = query.Where(p => p.Name.Contains(parameters.Search, StringComparison.OrdinalIgnoreCase) ||
                                            p.Area.Contains(parameters.Search, StringComparison.OrdinalIgnoreCase) ||
                                            p.Type.ToString().Contains(parameters.Search, StringComparison.OrdinalIgnoreCase));
            }

            // Apply sorting if specified
            if (!string.IsNullOrEmpty(parameters.SortBy) && sortFields.ContainsKey(parameters.SortBy.ToLower()))
            {
              var sortField = sortFields[parameters.SortBy.ToLower()];
              if (sortField == "Name")
              {
                query = parameters.SortDirection?.ToLower() == "desc"
                          ? query.OrderByDescending(p => p.Name)
                          : query.OrderBy(p => p.Name);
              }
              else if (sortField == "Type")
              {
                query = parameters.SortDirection?.ToLower() == "desc"
                          ? query.OrderByDescending(p => p.Type)
                          : query.OrderBy(p => p.Type);
              }
              else if (sortField == "Area")
              {
                query = parameters.SortDirection?.ToLower() == "desc"
                          ? query.OrderByDescending(p => p.Area)
                          : query.OrderBy(p => p.Area);
              }
            }

            var skip = (parameters.PageNumber - 1) * parameters.PageSize;
            var data = query.Skip(skip).Take(parameters.PageSize).ToList();

            return new PaginatedResult<Pump>
            {
              Data = data,
              TotalCount = totalCount,
              PageNumber = parameters.PageNumber,
              PageSize = parameters.PageSize,
              TotalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize)
            };
          });

      return mockQueryBuilder;
    }

    public static PumpService CreatePumpService(DataContext context = null, Mock<IMapper> mockMapper = null, Mock<IQueryBuilderService> mockQueryBuilder = null)
    {
      context ??= CreateInMemoryContext();
      mockMapper ??= CreateMockMapper();
      mockQueryBuilder ??= CreateMockQueryBuilder();

      return new PumpService(context, mockMapper.Object, mockQueryBuilder.Object);
    }

    public static async Task<User> CreateTestUser(DataContext context, int userId = 1, UserRole role = UserRole.Admin)
    {
      var user = new User { Id = userId, Username = $"testuser{userId}", Role = role };
      await context.Users.AddAsync(user);
      await context.SaveChangesAsync();
      return user;
    }

    public static async Task<List<Pump>> CreateTestPumps(DataContext context, int userId = 1, int count = 3, int startId = 1)
    {
      var pumps = new List<Pump>();
      for (int i = 0; i < count; i++)
      {
        var pumpId = startId + i;
        pumps.Add(new Pump
        {
          Id = pumpId,
          Name = $"Pump {pumpId}",
          UserId = userId,
          Type = PumpType.Centrifugal,
          Area = "North",
          Latitude = 1.0,
          Longitude = 1.0,
          FlowRate = 100,
          Offset = 0,
          CurrentPressure = 2.5,
          MinPressure = 2.0,
          MaxPressure = 3.0
        });
      }
      await context.Pumps.AddRangeAsync(pumps);
      await context.SaveChangesAsync();
      return pumps;
    }
  }
}