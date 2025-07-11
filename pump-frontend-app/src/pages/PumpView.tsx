import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  IconButton,
} from "@mui/material";
import { pumpAPI, pumpInspectionAPI } from "../services/api";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Fix default marker icon issue in Leaflet + Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pumpTypes = [
  "Centrifugal",
  "Submersible",
  "Diaphragm",
  "Rotary",
  "Peristaltic",
];

const PumpView = () => {
  const { id } = useParams();
  const [pump, setPump] = useState<any>(null);
  const [pressureHistory, setPressureHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<string>("line");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPumpData = async () => {
      setLoading(true);
      try {
        const [pumpData, historyData] = await Promise.all([
          pumpAPI.getPumpById(Number(id)),
          pumpInspectionAPI.getPressureHistory(Number(id), 30),
        ]);
        setPump(pumpData);
        setPressureHistory(historyData.Data || []);
      } catch (err) {
        setPump(null);
        setPressureHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPumpData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }
  if (!pump) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <IconButton onClick={() => navigate("/pumps")}>
          <ArrowBack />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Pump {pump.Id}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            minWidth: "25vw",
          }}
        >
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="body2" color="text.secondary">
              Pump ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {pump.Id}
            </Typography>
          </Box>
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Operational
            </Typography>
          </Box>
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {new Date(pump.LastUpdated).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
        Attributes
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{ mb: 2, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Type
          </Typography>
          <Typography variant="body1">
            {pumpTypes[pump.Type - 1] || pump.Type}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Area/Block
          </Typography>
          <Typography variant="body1">{pump.Area}</Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Location (lat/lon)
          </Typography>
          <Typography variant="body1">
            {typeof pump.Latitude === "number" ? pump.Latitude.toFixed(4) : ""},{" "}
            {typeof pump.Longitude === "number"
              ? pump.Longitude.toFixed(4)
              : ""}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Flow Rate
          </Typography>
          <Typography variant="body1">
            {typeof pump.FlowRate === "number" ? pump.FlowRate.toFixed(1) : ""}{" "}
            GPM
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Offset
          </Typography>
          <Typography variant="body1">
            {typeof pump.Offset === "number" ? pump.Offset.toFixed(1) : ""} sec
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Pressure (Current | Min | Max)
          </Typography>
          <Typography variant="body1">
            {typeof pump.CurrentPressure === "number"
              ? pump.CurrentPressure.toFixed(1)
              : ""}{" "}
            psi |{" "}
            {typeof pump.MinPressure === "number"
              ? pump.MinPressure.toFixed(1)
              : ""}{" "}
            psi |{" "}
            {typeof pump.MaxPressure === "number"
              ? pump.MaxPressure.toFixed(1)
              : ""}{" "}
            psi
          </Typography>
        </Box>
      </Grid>
      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
        Map
      </Typography>
      <Paper
        sx={{
          width: "100%",
          height: 300,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={[pump.Latitude, pump.Longitude]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
      </Paper>
      <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
        Pressure Over Time
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="body2">Select Chart Type</Typography>
        <FormControl size="small">
          <Select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="bar">Bar</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {pump.CurrentPressure?.toFixed(1)} psi
        </Typography>
        <Typography variant="body2" color="success.main">
          {pressureHistory.length > 0
            ? `Last ${pressureHistory.length} readings available`
            : "No pressure history available"}
        </Typography>
      </Box>
      <Paper
        sx={{
          width: "100%",
          height: 300,
          p: 2,
        }}
      >
        {pressureHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={pressureHistory.map((reading) => ({
                  date: new Date(reading.Date).toLocaleDateString(),
                  pressure: reading.Pressure,
                  flowRate: reading.FlowRate,
                  isOperational: reading.IsOperational ? 1 : 0,
                }))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Pressure (psi)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} ${
                      name === "pressure"
                        ? "psi"
                        : name === "flowRate"
                        ? "GPM"
                        : ""
                    }`,
                    name === "pressure"
                      ? "Pressure"
                      : name === "flowRate"
                      ? "Flow Rate"
                      : "Operational",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
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
              <BarChart
                data={pressureHistory.map((reading) => ({
                  date: new Date(reading.Date).toLocaleDateString(),
                  pressure: reading.Pressure,
                  flowRate: reading.FlowRate,
                  isOperational: reading.IsOperational ? 1 : 0,
                }))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Pressure (psi)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} ${
                      name === "pressure"
                        ? "psi"
                        : name === "flowRate"
                        ? "GPM"
                        : ""
                    }`,
                    name === "pressure"
                      ? "Pressure"
                      : name === "flowRate"
                      ? "Flow Rate"
                      : "Operational",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="pressure" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary" align="center">
              No pressure history available
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PumpView;
