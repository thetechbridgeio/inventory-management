"use client";

import {
  createContext,
  ReactNode,
  useContext,
} from "react";

import { createClient } from "@/lib/supabase/client";

import { useMe } from "@/features/auth/hooks/use-me";
import { UserRole } from "../constants/user-role";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
};

type LoginData = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;

  hasRole: (...roles: string[]) => boolean;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  const { data, isLoading } = useMe();

  const user = data?.data ?? null;

  async function login(data: LoginData) {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) {
      throw error;
    }
  }

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  function hasRole(...roles: string[]) {
    if (!user) {
      return false;
    }

    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,

        login,
        logout,

        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}