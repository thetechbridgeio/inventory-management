import "server-only";

import { transporter } from "@/features/email/service/transporter";
import { passwordResetEmailTemplate } from "./password-reset-email-template";

export async function sendPasswordResetEmail(email: string, actionLink: string) {
  const { subject, html, text } = passwordResetEmailTemplate(actionLink);

  return transporter.sendMail({
    from: `"InventoryEdge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
    text,
  });
}
