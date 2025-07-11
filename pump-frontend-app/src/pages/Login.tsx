import { useState } from "react";
import { Typography, TextField, Button, Box, Alert, Link } from "@mui/material";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserName } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5073/auth/login", {
        username,
        password,
      });

      if (response.data.Success) {
        setUserName(username, response.data.Data.AccessToken);
        localStorage.setItem("refreshToken", response.data.Data.RefreshToken);
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        setError(response.data.Message || "Login failed");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.Message || "Login failed. Please try again."
      );
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
          Welcome back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              mb: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              textTransform: "none",
            }}
          >
            Log in
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/register" underline="hover">
            Register
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
