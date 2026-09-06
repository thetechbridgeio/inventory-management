"use client";

import { createContext, ReactNode, useContext } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { UserRole } from "../constants/user-role";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: CurrentUser;
}) {
  const supabase = createClient();
  const router = useRouter();

  const user = initialUser;

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Failed to sign out");
      throw error;
    }

    toast.success("Signed out successfully");
    router.replace("/");
    router.refresh();
  }

  function hasRole(...roles: UserRole[]) {
    return roles.includes(user.role);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
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
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
