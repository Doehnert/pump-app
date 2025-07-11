import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Pagination,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  FormControl as MuiFormControl,
  InputLabel as MuiInputLabel,
} from "@mui/material";
import {
  Delete,
  Edit,
  Visibility,
  Search,
  Close,
  Clear,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { pumpAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import PumpModal from "../components/PumpModal";

const pumpTypes = [
  "Centrifugal",
  "Submersible",
  "Diaphragm",
  "Rotary",
  "Peristaltic",
];

type Pump = {
  name: string;
  type: string;
  area: string;
  lat: string | number;
  lng: string | number;
  flow: string | number;
  offset: string | number;
  current: string | number;
  min: string | number;
  max: string | number;
  id?: string | number;
};

const Pumps = () => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPump, setCurrentPump] = useState<Pump | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPumps = async () => {
      setLoading(true);
      try {
        const response = await pumpAPI.getAllPumps({
          search,
          sortBy,
          sortDirection,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        });

        // Map backend response to frontend Pump type
        const mapped = response.Data.map((p: any) => ({
          id: p.Id,
          name: p.Name,
          type: pumpTypes[p.Type - 1] || String(p.Type),
          area: p.Area,
          lat: p.Latitude.toFixed(4),
          lng: p.Longitude.toFixed(4),
          flow: `${p.FlowRate.toFixed(1)} GPM`,
          offset: `${p.Offset.toFixed(1)} sec`,
          current: `${p.CurrentPressure.toFixed(1)} psi`,
          min: `${p.MinPressure.toFixed(1)} psi`,
          max: `${p.MaxPressure.toFixed(1)} psi`,
        }));

        setRows(mapped);
        setPagination({
          pageNumber: response.PageNumber,
          pageSize: response.PageSize,
          totalCount: response.TotalCount,
          totalPages: response.TotalPages,
          hasPreviousPage: response.HasPreviousPage,
          hasNextPage: response.HasNextPage,
        });
      } catch (err) {
        alert("Failed to fetch pumps");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPumps();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    search,
    sortBy,
    sortDirection,
    pagination.pageNumber,
    pagination.pageSize,
  ]);

  const handleDelete = async (id: string | number | undefined) => {
    if (!id) {
      alert("Pump ID is required to delete a pump");
      return;
    }
    if (confirm("Are you sure you want to delete this pump?")) {
      try {
        await pumpAPI.deletePump(Number(id));
        setRows((prev) => prev.filter((row) => row.id !== id));
      } catch (err) {
        alert("Failed to delete pump");
      }
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (pump: Pump) => {
    // Remove units for editing
    setCurrentPump({
      ...pump,
      lat: parseFloat(pump.lat as string),
      lng: parseFloat(pump.lng as string),
      flow: parseFloat(pump.flow as string),
      offset: parseFloat(pump.offset as string),
      current: parseFloat(pump.current as string),
      min: parseFloat(pump.min as string),
      max: parseFloat(pump.max as string),
    });
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleNewPumpOpen = () => {
    setCurrentPump({
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
    });
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentPump(null);
  };

  const handlePumpSave = async (pump: Pump) => {
    setSaving(true);
    try {
      if (isEditMode) {
        // Update existing pump
        let id: number = Number(pump.id || pump.name);
        const backendData = {
          Name: pump.name,
          Type: pumpTypes.findIndex((t) => t === pump.type) + 1,
          Area: pump.area,
          Latitude: Number(pump.lat),
          Longitude: Number(pump.lng),
          FlowRate: Number(pump.flow),
          Offset: Number(pump.offset),
          CurrentPressure: Number(pump.current),
          MinPressure: Number(pump.min),
          MaxPressure: Number(pump.max),
        };
        await pumpAPI.updatePump(id, backendData);

        // Update local table data (format for display)
        setRows((prev) =>
          prev.map((row) =>
            (row.id || row.name) === id
              ? {
                  ...pump,
                  type: pumpTypes[backendData.Type - 1],
                  lat: backendData.Latitude.toFixed(4),
                  lng: backendData.Longitude.toFixed(4),
                  flow: `${backendData.FlowRate.toFixed(1)} GPM`,
                  offset: `${backendData.Offset.toFixed(1)} sec`,
                  current: `${backendData.CurrentPressure.toFixed(1)} psi`,
                  min: `${backendData.MinPressure.toFixed(1)} psi`,
                  max: `${backendData.MaxPressure.toFixed(1)} psi`,
                }
              : row
          )
        );
      } else {
        // Create new pump
        const backendData = {
          Name: pump.name,
          Type: pumpTypes.findIndex((t) => t === pump.type) + 1,
          Area: pump.area,
          Latitude: Number(pump.lat),
          Longitude: Number(pump.lng),
          FlowRate: Number(pump.flow),
          Offset: Number(pump.offset),
          CurrentPressure: Number(pump.current),
          MinPressure: Number(pump.min),
          MaxPressure: Number(pump.max),
        };
        await pumpAPI.createPump(backendData);

        // Refresh the pump list
        const response = await pumpAPI.getAllPumps({
          search,
          sortBy,
          sortDirection,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
        });
        const mapped = response.Data.map((p: any) => ({
          id: p.Id,
          name: p.Name,
          type: pumpTypes[p.Type - 1] || String(p.Type),
          area: p.Area,
          lat: p.Latitude.toFixed(4),
          lng: p.Longitude.toFixed(4),
          flow: `${p.FlowRate.toFixed(1)} GPM`,
          offset: `${p.Offset.toFixed(1)} sec`,
          current: `${p.CurrentPressure.toFixed(1)} psi`,
          min: `${p.MinPressure.toFixed(1)} psi`,
          max: `${p.MaxPressure.toFixed(1)} psi`,
        }));
        setRows(mapped);
      }

      setModalOpen(false);
      setCurrentPump(null);
    } catch (err) {
      alert(isEditMode ? "Failed to update pump" : "Failed to create pump");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 3 } }}>
      {/* Top search and user avatar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 2,
          mb: 2,
        }}
      >
        <Paper
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            // The search will be triggered by the useEffect when search state changes
          }}
          sx={{
            p: "2px 8px",
            display: "flex",
            alignItems: "center",
            width: 250,
            borderRadius: 2,
            boxShadow: 0,
            border: "1px solid #e0e0e0",
            background: "#fafbfc",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search pumps..."
            inputProps={{ "aria-label": "search pumps" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <IconButton
              onClick={() => setSearch("")}
              sx={{ p: 0.5 }}
              aria-label="clear search"
            >
              <Clear fontSize="small" />
            </IconButton>
          )}
          <IconButton type="submit" sx={{ p: 0.5 }} aria-label="search">
            <Search />
          </IconButton>
        </Paper>
      </Box>

      {/* Page title and actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          mb: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Pumps
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
            onClick={handleNewPumpOpen}
          >
            New Pump
          </Button>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>Loading...</Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 0, borderRadius: 3 }}
        >
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("name")}
                >
                  Pump Name{" "}
                  {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("type")}
                >
                  Type{" "}
                  {sortBy === "type" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("area")}
                >
                  Area/Block{" "}
                  {sortBy === "area" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("lat")}
                >
                  Latitude{" "}
                  {sortBy === "lat" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("lng")}
                >
                  Longitude{" "}
                  {sortBy === "lng" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("flow")}
                >
                  Flow Rate{" "}
                  {sortBy === "flow" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("offset")}
                >
                  Offset{" "}
                  {sortBy === "offset" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("current")}
                >
                  Current Pressure{" "}
                  {sortBy === "current" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("min")}
                >
                  Min Pressure{" "}
                  {sortBy === "min" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleSort("max")}
                >
                  Max Pressure{" "}
                  {sortBy === "max" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={row.name + idx} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        p: 0,
                        minWidth: 0,
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {row.type}
                    </Button>
                  </TableCell>
                  <TableCell>{row.area}</TableCell>
                  <TableCell>{row.lat}</TableCell>
                  <TableCell>{row.lng}</TableCell>
                  <TableCell>{row.flow}</TableCell>
                  <TableCell>{row.offset}</TableCell>
                  <TableCell>{row.current}</TableCell>
                  <TableCell>{row.min}</TableCell>
                  <TableCell>{row.max}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/pumps/${row.id}`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Unified Pump Modal */}
      <PumpModal
        open={modalOpen}
        onClose={handleModalClose}
        pump={currentPump}
        isEdit={isEditMode}
        onSave={handlePumpSave}
        saving={saving}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3,
          }}
        >
          <MuiFormControl size="small" sx={{ minWidth: 120 }}>
            <MuiInputLabel id="page-size-label">Rows per page</MuiInputLabel>
            <MuiSelect
              labelId="page-size-label"
              value={pagination.pageSize}
              label="Rows per page"
              onChange={(e) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  pageNumber: 1, // Reset to first page
                }));
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <MuiMenuItem key={size} value={size}>
                  {size}
                </MuiMenuItem>
              ))}
            </MuiSelect>
          </MuiFormControl>
          <Pagination
            count={pagination.totalPages}
            page={pagination.pageNumber}
            onChange={(_, value) =>
              setPagination((prev) => ({ ...prev, pageNumber: value }))
            }
            color="primary"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" sx={{ ml: 2 }}>
            {`Total: ${pagination.totalCount} pumps`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Pumps;
