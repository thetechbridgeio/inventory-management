"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

type LinkStatus = "checking" | "ready" | "invalid";

function getInitialStatus(): LinkStatus {
  if (typeof window === "undefined") return "checking";

  const params = new URLSearchParams(window.location.search);

  if (params.get("error_description") || params.get("error")) {
    return "invalid";
  }

  return "checking";
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<LinkStatus>(getInitialStatus);
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, loading } = useResetPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (status !== "checking") return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus((current) => (current === "checking" && session ? "ready" : current));
    });

    const timeout = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [status]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    await resetPassword(data.password.trim());
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-5 text-center">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={250}
                height={250}
                priority
              />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Reset Password
              </CardTitle>

              <CardDescription className="text-base">
                {status === "ready" && "Enter your new password below"}
                {status === "invalid" && "This reset link is invalid or has expired"}
                {status === "checking" && "Verifying your reset link..."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {status === "checking" && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {status === "invalid" && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Please request a new password reset link from the login page.
                </p>

                <Button asChild className="w-full">
                  <Link href="/">Back to login</Link>
                </Button>
              </div>
            )}

            {status === "ready" && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="h-11 pr-11"
                      disabled={loading}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-9 w-9"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>

                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className="h-11"
                    disabled={loading}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === getValues("password") || "Passwords do not match",
                    })}
                  />

                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
