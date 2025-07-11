import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box, Container } from "@mui/material";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login.tsx";
import Pumps from "./pages/Pumps";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUser } from "../contexts/UserContext";
import Header from "./components/Header";
import Register from "./pages/Register";
import PumpView from "./pages/PumpView";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw",
          overflowX: "hidden",
        }}
      >
        <Header />
        <Container
          component="main"
          maxWidth={isLoginPage ? false : "xl"}
          disableGutters={isLoginPage}
          sx={{
            mt: isLoginPage ? 0 : 4,
            mb: 4,
            flex: 1,
            p: isLoginPage ? 0 : undefined,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/pumps"
              element={
                <ProtectedRoute>
                  <Pumps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pumps/:id"
              element={
                <ProtectedRoute>
                  <PumpView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
