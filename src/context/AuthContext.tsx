"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { isAdminRole, isPemohon } from "@/lib/roleUtils";

interface User {
  userId: string;
  email: string;
  nama: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  getUserRole: () => string | null;
  getUserName: () => string | null;
  getUserId: () => string | null;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    // Log logout activity (non-blocking)
    try {
      const currentUser = user || JSON.parse(localStorage.getItem("user_data") || '{}');
      const currentRole = currentUser.role || localStorage.getItem("user_role");
      
      if (currentUser.userId && currentRole) {
        fetch('/api/logs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'LOGOUT',
            level: 'INFO',
            message: `${currentRole} logout: ${currentUser.nama || currentUser.email}`,
            user_id: currentUser.userId,
            user_role: currentRole,
            user_email: currentUser.email
          })
        }).catch(err => console.error('Failed to log logout:', err));
      }
    } catch (error) {
      console.error('Failed to log logout activity:', error);
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_role");
    router.push("/login");
  }, [router, user]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const savedToken = localStorage.getItem("auth_token");
      
      if (savedToken) {
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired, logout user
            logout();
            return false;
          }
          return true;
        } catch {
          // Invalid token, logout user
          logout();
          return false;
        }
      }
      return false;
    };

    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("user_data");
    
    if (savedToken && checkTokenExpiration()) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    
    setLoading(false);

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email);
      const data = await loginUser(email, password);
      console.log('Login API response:', data);
      
      const newToken = data.token;
      
      if (!newToken) {
        console.error('No token in response');
        throw new Error("Token tidak ditemukan dalam response");
      }
      
      console.log('Token received, decoding...');
      // Decode JWT untuk mendapatkan user data
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      console.log('Decoded payload:', payload);
      
      const finalUserData = {
        userId: payload.userId,
        email: payload.email,
        nama: payload.nama,
        role: payload.role
      };
      
      console.log('Setting user data:', finalUserData);
      setToken(newToken);
      setUser(finalUserData);
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("user_data", JSON.stringify(finalUserData));
      localStorage.setItem("user_role", finalUserData.role);
      
      // Log login activity (non-blocking)
      fetch('/api/logs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          level: 'INFO',
          message: `${finalUserData.role} login: ${finalUserData.nama || finalUserData.email}`,
          user_id: finalUserData.userId,
          user_role: finalUserData.role,
          user_email: finalUserData.email
        })
      }).catch(err => console.error('Failed to log login:', err));
      
      console.log('Redirecting based on role:', finalUserData.role);
      // Direct redirect based on role
      if (isAdminRole(finalUserData.role)) {
        console.log('Redirecting to admin dashboard');
        router.push("/admin/dashboard");
      } else if (isPemohon(finalUserData.role)) {
        console.log('Redirecting to pemohon dashboard');
        router.push("/pemohon/dashboard");
      } else {
        console.log('Redirecting to default dashboard');
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      throw error;
    }
  };



  const getUserRole = useCallback(() => {
    return user?.role || localStorage.getItem("user_role");
  }, [user?.role]);

  const getUserName = useCallback(() => {
    return user?.nama || null;
  }, [user?.nama]);

  const getUserId = useCallback(() => {
    return user?.userId || null;
  }, [user?.userId]);

  const getToken = useCallback(() => {
    return token || localStorage.getItem("auth_token");
  }, [token]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, loading, getUserRole, getUserName, getUserId, getToken }}>
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