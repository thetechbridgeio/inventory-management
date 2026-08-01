"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForgotPassword } from "../hooks/use-forgot-password";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendResetEmail, loading } = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await sendResetEmail(data.email);
      setSent(true);
    } catch {
      // handled via toast in useForgotPassword
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSent(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="h-auto p-0 text-sm">
          Forgot password?
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>

          <DialogDescription>
            {sent
              ? "Check your inbox for a link to reset your password."
              : "Enter your email and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <DialogFooter>
            <Button type="button" className="w-full" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>

              <Input
                id="reset-email"
                type="text"
                placeholder="Enter your email"
                disabled={loading}
                {...register("email", { required: "Email is required" })}
              />

              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
