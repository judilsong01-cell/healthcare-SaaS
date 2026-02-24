import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken, clearAuthToken, getAuthToken } from "@/services/axiosClient";

/**
 * Auth Context
 * 
 * Design Philosophy: Gerenciamento de Autenticação Centralizado
 * - JWT token management
 * - Verificação de sessão
 * - Persistência de token
 * - Logout automático
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      // Validar token com o backend
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      setIsLoading(true);
      // Chamada ao backend para validar token
      // const response = await fetch(`${API_URL}/auth/validate`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setUser(data.user);
      // setToken(token);

      // Por enquanto, simular validação
      setToken(token);
      setAuthToken(token);
    } catch (err) {
      clearAuthToken();
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Chamada ao backend
      // const response = await fetch(`${API_URL}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();

      // Simular resposta
      const data = {
        token: "jwt-token-" + Date.now(),
        user: {
          id: "user-1",
          email,
          name: "João Silva",
          role: "patient" as const,
        },
      };

      setToken(data.token);
      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem("auth_token", data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Chamada ao backend
      // const response = await fetch(`${API_URL}/auth/signup`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password, name, role })
      // });
      // const data = await response.json();

      // Simular resposta
      const data = {
        token: "jwt-token-" + Date.now(),
        user: {
          id: "user-" + Date.now(),
          email,
          name,
          role: (role as "patient" | "doctor" | "admin") || "patient",
        },
      };

      setToken(data.token);
      setUser(data.user);
      setAuthToken(data.token);
      localStorage.setItem("auth_token", data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Chamada ao backend para logout
      // await fetch(`${API_URL}/auth/logout`, {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      setUser(null);
      setToken(null);
      clearAuthToken();
      localStorage.removeItem("auth_token");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer logout";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        signup,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
