import {
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
  Button,
  IconButton,
  Typography,
  Box,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import React from "react";

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

interface PumpModalProps {
  open: boolean;
  onClose: () => void;
  pump: Pump | null;
  isEdit: boolean;
  onSave: (pump: Pump) => void;
  saving: boolean;
}

type Inputs = {
  name: string;
  type: string;
  area: string;
  lat: string;
  lng: string;
  flow: string;
  offset: string;
  min: string;
  max: string;
};

// Validation schema
const schema = yup
  .object({
    name: yup.string().required("Pump name is required"),
    type: yup.string().required("Pump type is required"),
    area: yup.string().required("Area is required"),
    lat: yup
      .string()
      .required("Latitude is required")
      .test(
        "is-number",
        "Latitude must be a valid number between -90 and 90",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num >= -90 && num <= 90;
        }
      ),
    lng: yup
      .string()
      .required("Longitude is required")
      .test(
        "is-number",
        "Longitude must be a valid number between -180 and 180",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num >= -180 && num <= 180;
        }
      ),
    flow: yup
      .string()
      .required("Flow rate is required")
      .test(
        "is-positive-number",
        "Flow rate must be a positive number",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num > 0;
        }
      ),
    offset: yup
      .string()
      .required("Offset is required")
      .test(
        "is-positive-number",
        "Offset must be a positive number",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num > 0;
        }
      ),
    min: yup
      .string()
      .required("Min pressure is required")
      .test(
        "is-positive-number",
        "Min pressure must be a positive number",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num > 0;
        }
      )
      .test(
        "min-max-comparison",
        "Pressure Min should be lower than Pressure Max",
        (value, context) => {
          const min = Number(value);
          const max = Number(context.parent.max);
          return min < max; // This will fail if min >= max
        }
      ),
    max: yup
      .string()
      .required("Max pressure is required")
      .test(
        "is-positive-number",
        "Max pressure must be a positive number",
        (value) => {
          const num = Number(value);
          return !isNaN(num) && num > 0;
        }
      )
      .test(
        "min-max-comparison",
        "Pressure Max should be greater than Pressure Min",
        (value, context) => {
          const max = Number(value);
          const min = Number(context.parent.min);
          return max > min; // This will fail if min >= max
        }
      ),
  })
  .required();

const PumpModal = ({
  open,
  onClose,
  pump,
  isEdit,
  onSave,
  saving,
}: PumpModalProps) => {
  if (!pump) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Inputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: pump.name,
      type: pump.type,
      area: pump.area,
      lat: String(pump.lat),
      lng: String(pump.lng),
      flow: String(pump.flow),
      offset: String(pump.offset),
      min: String(pump.min),
      max: String(pump.max),
    },
  });

  // Update form values when pump changes
  React.useEffect(() => {
    if (pump) {
      setValue("name", pump.name);
      setValue("type", pump.type);
      setValue("area", pump.area);
      setValue("lat", String(pump.lat));
      setValue("lng", String(pump.lng));
      setValue("flow", String(pump.flow));
      setValue("offset", String(pump.offset));
      setValue("min", String(pump.min));
      setValue("max", String(pump.max));
    }
  }, [pump, setValue]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const pumpData: Pump = {
      ...pump,
      name: data.name,
      type: data.type,
      area: data.area,
      lat: Number(data.lat),
      lng: Number(data.lng),
      flow: Number(data.flow),
      offset: Number(data.offset),
      min: Number(data.min),
      max: Number(data.max),
    };
    onSave(pumpData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {isEdit ? "Edit Pump" : "Add New Pump"}
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ mt: 1 }}>
            {isEdit ? (
              <>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {pump.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Pump ID <b style={{ marginLeft: 8 }}>{pump.id}</b>
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new pump with the following details
              </Typography>
            )}

            <TextField
              label="Pump Name"
              {...register("name")}
              fullWidth
              margin="normal"
              InputProps={isEdit ? { readOnly: true } : undefined}
              required={!isEdit}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <FormControl fullWidth margin="normal" error={!!errors.type}>
              <InputLabel>Pump Type</InputLabel>
              <Select
                {...register("type")}
                label="Pump Type"
                defaultValue={pump.type}
              >
                {pumpTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <FormHelperText error>{errors.type.message}</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Area"
              {...register("area")}
              fullWidth
              margin="normal"
              required
              error={!!errors.area}
              helperText={errors.area?.message}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Latitude"
                {...register("lat")}
                type="number"
                margin="normal"
                fullWidth
                inputProps={{ step: "any" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°N</InputAdornment>
                  ),
                }}
                required
                error={!!errors.lat}
                helperText={errors.lat?.message}
              />
              <TextField
                label="Longitude"
                {...register("lng")}
                type="number"
                margin="normal"
                fullWidth
                inputProps={{ step: "any" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°E</InputAdornment>
                  ),
                }}
                required
                error={!!errors.lng}
                helperText={errors.lng?.message}
              />
            </Box>

            <TextField
              label="Flow Rate"
              {...register("flow")}
              type="number"
              margin="normal"
              fullWidth
              inputProps={{ step: "any" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">GPM</InputAdornment>
                ),
              }}
              required
              error={!!errors.flow}
              helperText={errors.flow?.message}
            />

            <TextField
              label="Offset"
              {...register("offset")}
              type="number"
              margin="normal"
              fullWidth
              inputProps={{ step: "any" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">sec</InputAdornment>
                ),
              }}
              required
              error={!!errors.offset}
              helperText={errors.offset?.message}
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
              <TextField
                label="Pressure Min"
                {...register("min")}
                type="number"
                fullWidth
                inputProps={{ step: "any" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">psi</InputAdornment>
                  ),
                }}
                required
                error={!!errors.min}
                helperText={errors.min?.message}
              />
              <TextField
                label="Pressure Max"
                {...register("max")}
                type="number"
                fullWidth
                inputProps={{ step: "any" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">psi</InputAdornment>
                  ),
                }}
                required
                error={!!errors.max}
                helperText={errors.max?.message}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {isEdit ? "Save" : "Create Pump"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PumpModal;
