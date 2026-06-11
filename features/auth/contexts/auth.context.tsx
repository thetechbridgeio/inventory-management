"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";

type LoginData = {
  email: string;
  password: string;
};

type AuthContextType = {
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

export function AuthActionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();

  async function login(data: LoginData) {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
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
      "useAuth must be used within AuthActionProvider",
    );
  }

  return context;
}