"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type LoginData = {
  email: string;
  password: string;
};

export function useLogin() {
  const supabase = createClient();
  const router = useRouter();

  async function login(data: LoginData) {
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      switch (error.message) {
        case "Invalid login credentials":
          toast.error("Invalid email or password");
          break;
        case "Email not confirmed":
          toast.error("Please verify your email before signing in");
          break;
        default:
          toast.error("Failed to sign in. Please try again");
      }

      throw error;
    }

    toast.success("Signed in successfully");
    router.replace("/dashboard");
    router.refresh();
  }

  return { login };
}