import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/api";
import type { AuthResponse, LoginRequest, Role } from "../types";

interface AuthContextType {
  user: { id: number; email: string; role: Role } | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("jwt_token")
  );
  const [user, setUser] = useState<{ id: number; email: string; role: Role } | null>(
    () => {
      const saved = localStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    }
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const data = await authService.login(credentials);
    const userData = { id: data.id, email: data.email, role: data.role };
    setToken(data.token);
    setUser(userData);
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("auth_user");
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
