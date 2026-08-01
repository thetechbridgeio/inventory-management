import { NextRequest } from "next/server";
import z from "zod";

import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { generatePasswordResetToken } from "@/features/auth/service/generate-password-reset-token.service";
import { sendPasswordResetEmail } from "@/features/auth/service/send-password-reset-email.service";

const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email } = forgotPasswordSchema.parse(body);

  const normalizedEmail = email.trim().toLowerCase();
  const hashedToken = await generatePasswordResetToken(normalizedEmail);

  if (hashedToken) {
    const confirmLink = `${request.nextUrl.origin}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=${encodeURIComponent("/reset-password")}`;

    await sendPasswordResetEmail(normalizedEmail, confirmLink);
  }

  return {
    message: "If an account exists for this email, a reset link has been sent",
  };
});
