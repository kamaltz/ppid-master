"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { isAdminRole, isPemohon } from "@/lib/roleUtils";

interface AuthContextType {
  token: string | null;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user_data");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      const newToken = data.token;
      
      if (!newToken) {
        throw new Error("Token tidak ditemukan dalam response");
      }
      
      // Decode JWT untuk mendapatkan user data
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const finalUserData = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
      
      setToken(newToken);
      setUser(finalUserData);
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("user_data", JSON.stringify(finalUserData));
      localStorage.setItem("user_role", finalUserData.role);
      
      // Direct redirect based on role
      if (isAdminRole(finalUserData.role)) {
        router.push("/admin/dashboard");
      } else if (isPemohon(finalUserData.role)) {
        router.push("/pemohon/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_role");
    router.push("/login");
  };

  const getUserRole = () => {
    return user?.role || localStorage.getItem("user_role");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};