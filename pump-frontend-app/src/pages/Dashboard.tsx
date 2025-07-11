import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
  Skeleton,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Dashboard as DashboardIcon,
  Settings,
  Assessment,
  Warning,
  CheckCircle,
  Engineering,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";

const COLORS = ["#1976d2", "#dc004e", "#2e7d32", "#ed6c02", "#9c27b0"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await dashboardAPI.getDashboardStats();
        setStats(response.Data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          Failed to load dashboard data
        </Typography>
      </Box>
    );
  }

  const pumpTypeData =
    stats.PumpTypes?.map((type: any) => ({
      name: type.Type,
      value: type.Count,
    })) || [];

  const areaData =
    stats.AreaDistribution?.map((area: any) => ({
      name: area.Area,
      value: area.Count,
    })) || [];

  const inspectionStatusData =
    stats.InspectionStatuses?.map((status: any) => ({
      name: status.Status,
      value: status.Count,
    })) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minWidth: "250px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Engineering sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Total Pumps
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {stats.Summary?.TotalPumps || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minWidth: "250px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircle sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Operational
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                {stats.Summary?.OperationalPumps || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minWidth: "250px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Warning sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">Non-Operational</Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "warning.main" }}
              >
                {stats.Summary?.NonOperationalPumps || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", minWidth: "250px" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assessment sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">Recent Inspections</Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "info.main" }}
              >
                {stats.Summary?.RecentInspections || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 7 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Pump Types Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Pump Types Distribution
            </Typography>
            {pumpTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pumpTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent || 0) * 100}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pumpTypeData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} pumps`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography color="text.secondary">
                  No pump type data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Area Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Pumps by Area
            </Typography>
            {areaData.length > 0 ? (
              <ResponsiveContainer minWidth={400} width="100%" height="100%">
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} pumps`, "Count"]} />
                  <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography color="text.secondary">
                  No area data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Inspection Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Inspection Status Distribution
            </Typography>
            {inspectionStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inspectionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inspectionStatusData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} inspections`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography color="text.secondary">
                  No inspection data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
