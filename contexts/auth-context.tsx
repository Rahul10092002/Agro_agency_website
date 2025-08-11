"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import {
  getCurrentUser,
  storeUser,
  clearStoredUser,
  authenticateUser,
  logoutUser,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        storeUser(currentUser);
      } else {
        setUser(null);
        clearStoredUser();
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      clearStoredUser();
    }
  };

  useEffect(() => {
    // Check for authenticated user on mount
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(email, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        storeUser(authenticatedUser);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearStoredUser();
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
