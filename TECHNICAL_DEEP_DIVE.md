# Technical Deep Dive - Pump Master Application

## Conceptual Code Demonstration

This document showcases the most interesting technical challenges and solutions implemented in the Pump Master application, demonstrating strategic thinking and modern development practices.

## 1. Dynamic Query Building (Spatie QueryBuilder Equivalent)

### Challenge
Implement flexible sorting, filtering, and pagination similar to Laravel's Spatie QueryBuilder, allowing dynamic API queries without hardcoding field names.

### Solution
Created a generic `QueryBuilderService` using System.Linq.Dynamic.Core for dynamic LINQ expressions.

```csharp
public class QueryBuilderService : IQueryBuilderService
{
    public async Task<PaginatedResult<T>> GetPagedResultAsync<T>(
        IQueryable<T> query,
        QueryParameters parameters,
        Dictionary<string, string> allowedSortFields,
        Dictionary<string, string> allowedFilterFields) where T : class
    {
        // Apply search across multiple fields
        if (!string.IsNullOrEmpty(parameters.Search))
        {
            query = ApplySearch(query, parameters.Search, allowedFilterFields);
        }

        // Apply dynamic sorting
        if (!string.IsNullOrEmpty(parameters.SortBy) && 
            allowedSortFields.ContainsKey(parameters.SortBy.ToLower()))
        {
            var sortField = allowedSortFields[parameters.SortBy.ToLower()];
            var sortDirection = parameters.SortDirection?.ToLower() == "desc" ? "descending" : "ascending";
            query = query.OrderBy($"{sortField} {sortDirection}");
        }

        // Apply pagination
        var totalCount = await query.CountAsync();
        var skip = (parameters.PageNumber - 1) * parameters.PageSize;
        var data = await query.Skip(skip).Take(parameters.PageSize).ToListAsync();

        return new PaginatedResult<T>
        {
            Data = data,
            TotalCount = totalCount,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize)
        };
    }

    private IQueryable<T> ApplySearch<T>(IQueryable<T> query, string searchTerm, 
        Dictionary<string, string> allowedFields) where T : class
    {
        if (string.IsNullOrEmpty(searchTerm) || !allowedFields.Any())
            return query;

        // Build dynamic search expression across multiple fields
        var searchConditions = allowedFields.Select(field => 
            $"{field.Value}.Contains(\"{searchTerm}\")").ToList();

        var searchExpression = string.Join(" OR ", searchConditions);
        return query.Where(searchExpression);
    }
}
```

### Usage in PumpService
```csharp
public async Task<ServiceResponse<PaginatedResult<GetPumpDto>>> GetAllPumps(int userId, QueryParameters parameters)
{
    var query = _context.Pumps.AsQueryable();

    // Role-based filtering
    if (user.Role != UserRole.Admin)
    {
        query = query.Where(p => p.UserId == userId);
    }

    // Define allowed sort and filter fields
    var allowedSortFields = new Dictionary<string, string>
    {
        { "name", "Name" },
        { "type", "Type" },
        { "area", "Area" },
        { "lat", "Latitude" },
        { "lng", "Longitude" },
        { "flow", "FlowRate" },
        { "current", "CurrentPressure" },
        { "lastupdated", "LastUpdated" }
    };

    var allowedFilterFields = new Dictionary<string, string>
    {
        { "name", "Name" },
        { "type", "Type" },
        { "area", "Area" }
    };

    var pagedResult = await _queryBuilder.GetPagedResultAsync(
        query, parameters, allowedSortFields, allowedFilterFields);

    return new ServiceResponse<PaginatedResult<GetPumpDto>>
    {
        Data = new PaginatedResult<GetPumpDto>
        {
            Data = pagedResult.Data.Select(p => _mapper.Map<GetPumpDto>(p)).ToList(),
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize,
            TotalPages = pagedResult.TotalPages
        },
        Success = true
    };
}
```

## 2. Frontend-Backend Type Safety

### Challenge
Maintain type safety across API boundaries while ensuring consistent data contracts.

### Solution
Shared TypeScript interfaces and consistent API response handling.

```typescript
// API Response Types
interface PaginatedResponse<T> {
  Data: T[];
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;
}

interface Pump {
  Id: number;
  Name: string;
  Type: number;
  Area: string;
  Latitude: number;
  Longitude: number;
  FlowRate: number;
  Offset: number;
  CurrentPressure: number;
  MinPressure: number;
  MaxPressure: number;
  UserId: number;
  LastUpdated: string;
}

// API Service with Type Safety
export const pumpAPI = {
  getAllPumps: async (params?: {
    search?: string;
    sortBy?: string;
    sortDirection?: string;
    pageNumber?: number;
    pageSize?: number;
    filter?: string;
  }): Promise<PaginatedResponse<Pump>> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortDirection) queryParams.append("sortDirection", params.sortDirection);
    if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params?.filter) queryParams.append("filter", params.filter);

    const response = await api.get(`/api/pump?${queryParams.toString()}`);
    return response.data;
  }
};
```

## 3. Advanced State Management

### Challenge
Manage complex application state including authentication, pagination, sorting, and real-time updates.

### Solution
Combined React Context for global state and local state for component-specific data.

```typescript
// User Context for Global Authentication State
interface UserContextType {
  userName: string | null;
  isAuthenticated: boolean;
  setUserName: (name: string, token: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setUserName = (name: string, token: string) => {
    setUserNameState(name);
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUserNameState(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <UserContext.Provider value={{ userName, isAuthenticated, setUserName, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Component with Local State Management
const Pumps = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPumps();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, sortBy, sortDirection, pagination.pageNumber, pagination.pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };
};
```

## 4. Real-time Data Visualization

### Challenge
Display time-series pump data with interactive charts and real-time updates.

### Solution
Combined Recharts for data visualization with React Leaflet for geographic display.

```typescript
// Pressure History Chart Component
const PressureChart = ({ data, chartType }: { data: any[], chartType: 'line' | 'bar' }) => {
  const chartData = data.map(reading => ({
    date: new Date(reading.Date).toLocaleDateString(),
    pressure: reading.Pressure,
    flowRate: reading.FlowRate,
    isOperational: reading.IsOperational ? 1 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === "line" ? (
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
          <YAxis label={{ value: "Pressure (psi)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value, name) => [
            `${value} ${name === "pressure" ? "psi" : "GPM"}`,
            name === "pressure" ? "Pressure" : "Flow Rate"
          ]} />
          <Line
            type="monotone"
            dataKey="pressure"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ fill: "#1976d2", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
          <YAxis label={{ value: "Pressure (psi)", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(value) => [`${value} psi`, "Pressure"]} />
          <Bar dataKey="pressure" fill="#1976d2" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

// Interactive Map Component
const PumpMap = ({ pump }: { pump: any }) => (
  <MapContainer
    center={[pump.Latitude, pump.Longitude]}
    zoom={15}
    style={{ height: "100%", width: "100%" }}
    scrollWheelZoom={false}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[pump.Latitude, pump.Longitude]}>
      <Popup>
        {pump.Name || `Pump ${pump.Id}`}
        <br />
        {pump.Latitude.toFixed(4)}, {pump.Longitude.toFixed(4)}
      </Popup>
    </Marker>
  </MapContainer>
);
```

## 5. Form Validation and Error Handling

### Challenge
Implement robust form validation with real-time feedback and comprehensive error handling.

### Solution
React Hook Form with Yup validation and custom error handling.

```typescript
// Validation Schema
const pumpValidationSchema = yup.object({
  name: yup.string().required("Pump name is required").min(2, "Name must be at least 2 characters"),
  type: yup.string().required("Pump type is required"),
  area: yup.string().required("Area is required"),
  lat: yup.number()
    .required("Latitude is required")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: yup.number()
    .required("Longitude is required")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  flow: yup.number()
    .required("Flow rate is required")
    .positive("Flow rate must be positive"),
  offset: yup.number()
    .required("Offset is required")
    .positive("Offset must be positive"),
  current: yup.number()
    .required("Current pressure is required")
    .positive("Current pressure must be positive"),
  min: yup.number()
    .required("Minimum pressure is required")
    .positive("Minimum pressure must be positive"),
  max: yup.number()
    .required("Maximum pressure is required")
    .positive("Maximum pressure must be positive")
    .test("max-greater-than-min", "Maximum pressure must be greater than minimum pressure", 
      function(value) {
        const { min } = this.parent;
        return value > min;
      }),
});

// Form Component with Error Handling
const PumpModal = ({ open, onClose, pump, isEdit, onSave, saving }: PumpModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PumpFormData>({
    resolver: yupResolver(pumpValidationSchema),
    defaultValues: pump || {
      name: "",
      type: "Centrifugal",
      area: "",
      lat: 0,
      lng: 0,
      flow: 0,
      offset: 0,
      current: 0,
      min: 0,
      max: 0,
    },
  });

  const onSubmit = async (data: PumpFormData) => {
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving pump:", error);
      // Handle error appropriately
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="span" variant="h6">
          {isEdit ? "Edit Pump" : "Add New Pump"}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            {...register("name")}
            label="Pump Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          {/* Additional form fields with validation */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : (isEdit ? "Update" : "Create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

## 6. Performance Optimization

### Challenge
Ensure fast loading times and smooth user experience with large datasets.

### Solution
Multiple optimization strategies combined.

```typescript
// Debounced Search
useEffect(() => {
  const timeoutId = setTimeout(() => {
    fetchPumps();
  }, 500); // Debounce API calls

  return () => clearTimeout(timeoutId);
}, [search, sortBy, sortDirection, pagination.pageNumber, pagination.pageSize]);

// Virtual Scrolling for Large Tables (Future Enhancement)
const VirtualizedTable = ({ data }: { data: Pump[] }) => {
  const [virtualItems, setVirtualItems] = useState<Pump[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(50);

  useEffect(() => {
    setVirtualItems(data.slice(startIndex, endIndex));
  }, [data, startIndex, endIndex]);

  return (
    <div style={{ height: 400, overflow: "auto" }}>
      {virtualItems.map((pump, index) => (
        <TableRow key={pump.id} style={{ height: 50 }}>
          {/* Row content */}
        </TableRow>
      ))}
    </div>
  );
};

// Memoized Components
const PumpRow = React.memo(({ pump, onEdit, onDelete }: PumpRowProps) => {
  return (
    <TableRow hover>
      <TableCell>{pump.name}</TableCell>
      <TableCell>{pump.type}</TableCell>
      {/* Additional cells */}
    </TableRow>
  );
});
```

## 7. Security Implementation

### Challenge
Implement secure authentication and authorization while maintaining good user experience.

### Solution
JWT tokens with refresh mechanism and role-based access control.

```csharp
// JWT Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// Role-based Authorization
[HttpGet]
[Authorize(Roles = "Admin,FarmManager,Technician,Inspector")]
public async Task<ActionResult<PaginatedResult<GetPumpDto>>> GetPumps([FromQuery] QueryParameters parameters)
{
    int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
    var response = await _pumpService.GetAllPumps(userId, parameters);
    return Ok(response.Data);
}

// Frontend Route Protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};
```

## Conclusion

This technical deep-dive demonstrates several key strengths:

1. **Modern Architecture**: Clean separation of concerns with scalable patterns
2. **Type Safety**: Comprehensive TypeScript implementation
3. **Performance**: Optimized data loading and rendering
4. **Security**: Robust authentication and authorization
5. **User Experience**: Intuitive interface with real-time feedback
6. **Maintainability**: Well-structured, documented code
7. **Scalability**: Designed for future growth and enhancement

The implementation showcases strategic thinking, modern development practices, and a focus on delivering value while maintaining code quality and performance.

**Key Technical Achievements:**
- Dynamic query building similar to Spatie QueryBuilder
- Comprehensive type safety across frontend-backend boundary
- Advanced state management with React Context
- Real-time data visualization with interactive charts
- Robust form validation and error handling
- Performance optimization strategies
- Secure authentication and authorization 