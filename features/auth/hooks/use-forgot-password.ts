"use client";

import { useState } from "react";

import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);

  async function sendResetEmail(email: string) {
    setLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      toast.success("If an account exists for this email, a reset link has been sent");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { sendResetEmail, loading };
}
