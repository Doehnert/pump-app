import { AppBar, Toolbar, Typography, Button, Tabs, Tab } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { useUser } from "../../contexts/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

const navTabs = [
  { label: "Dashboard", path: "/" },
  { label: "Pumps", path: "/pumps" },
  { label: "Reports", path: "/reports" },
  { label: "Alerts", path: "/alerts" },
];

const Header = () => {
  const { userName, isLoggedIn, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Improved tab selection logic
  let currentTab = 0;
  if (location.pathname !== "/") {
    currentTab = navTabs.findIndex(
      (tab) => tab.path !== "/" && location.pathname.startsWith(tab.path)
    );
    if (currentTab === -1) currentTab = -1;
  }

  return (
    <AppBar position="static" elevation={3} sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{ fontWeight: 700, letterSpacing: 1, mr: 4 }}
        >
          Pump Management System
        </Typography>
        <Tabs
          value={currentTab}
          onChange={(_, idx) => navigate(navTabs[idx].path)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ minHeight: 48, flexGrow: 1 }}
        >
          {navTabs.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              sx={{ fontWeight: 600, minWidth: 120, textTransform: "none" }}
            />
          ))}
        </Tabs>
        {userName && (
          <Typography variant="body1" sx={{ mr: 2, fontWeight: 500 }}>
            Welcome, {userName}
          </Typography>
        )}
        {isLoggedIn && (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ fontWeight: 600 }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
