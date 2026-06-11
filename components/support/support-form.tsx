"use client";

import { Loader2, Send } from "lucide-react";

import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { SupportPayload, useSendSupport } from "@/features/email/hooks/use-send-email.hook";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SupportForm() {
  const { mutateAsync, isPending } = useSendSupport();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportPayload>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: SupportPayload) => {
    try {
      const response = await mutateAsync({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      });

      toast.success(
        response.data.message ??
          "Support request submitted successfully"
      );

      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to send support request"
        );

        return;
      }

      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold">
          Contact Support
        </CardTitle>

        <CardDescription>
          Fill out the form below and our support team will get back to you
          shortly.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>

              <Input
                id="name"
                placeholder="John Doe"
                disabled={isPending}
                className="h-11 rounded-xl"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name is too short",
                  },
                })}
              />

              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isPending}
                className="h-11 rounded-xl"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Invalid email address",
                  },
                })}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>

            <Input
              id="subject"
              placeholder="Issue regarding inventory updates"
              disabled={isPending}
              className="h-11 rounded-xl"
              {...register("subject", {
                required: "Subject is required",
                minLength: {
                  value: 3,
                  message: "Subject is too short",
                },
              })}
            />

            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>

            <Textarea
              id="message"
              rows={7}
              placeholder="Describe your issue or request in detail..."
              disabled={isPending}
              className="resize-none rounded-2xl"
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Message is too short",
                },
              })}
            />

            <p className="text-xs text-muted-foreground">
              Include screenshots, workflow steps, or error details if
              applicable.
            </p>

            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-xl px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}