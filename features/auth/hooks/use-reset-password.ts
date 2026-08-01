"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export function useResetPassword() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resetPassword(password: string) {
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("Failed to reset password. Please try again");
        throw error;
      }

      await supabase.auth.signOut();

      toast.success("Password reset successfully. Please sign in");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return { resetPassword, loading };
}
