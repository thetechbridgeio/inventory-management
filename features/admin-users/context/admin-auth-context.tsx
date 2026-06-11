"use client";

import { createContext, useContext, ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";

type AdminLoginData = {
  email: string;
  password: string;
};

type AdminAuthContextType = {
  login: (data: AdminLoginData) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  async function login(data: AdminLoginData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw error;
    }

    // verify authenticated user is in admin_users
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (adminError || !admin) {
      await supabase.auth.signOut();

      throw new Error("You are not authorized as a platform admin");
    }

    if (!admin) {
      await supabase.auth.signOut();

      throw new Error("You are not authorized as a platform admin");
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
