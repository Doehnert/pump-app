import { useState } from "react";
import { Typography, TextField, Button, Box, Alert, Link } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5073/auth/register", {
        username,
        password,
      });
      if (response.data.Success) {
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      } else {
        setError(response.data.Message || "Registration failed");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.Message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
        background: "#fafbfc",
      }}
    >
      <Box
        sx={{
          width: 350,
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ fontWeight: 700, mb: 3, mt: 1 }}
        >
          Create your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2, background: "#fff" },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2, background: "#fff" },
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            placeholder="Re-enter your password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 2, background: "#fff" },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              textTransform: "none",
            }}
          >
            Register
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          Already have an account?{" "}
          <Link href="/login" underline="hover">
            Log in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
