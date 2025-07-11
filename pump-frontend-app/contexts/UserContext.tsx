import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface UserContextType {
  userName: string;
  setUserName: (userName: string, token: string) => void;
  token: string;
  setToken: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("userName") || "";
  });
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem("token") || "";
  });

  const updateUser = (newUserName: string, newToken: string) => {
    setUserName(newUserName);
    setToken(newToken);
    localStorage.setItem("userName", newUserName);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setUserName("");
    setToken("");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  const value = {
    userName,
    setUserName: updateUser,
    token,
    setToken,
    logout,
    isLoggedIn: !!userName && !!token,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
