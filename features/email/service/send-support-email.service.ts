import { supportEmailTemplate } from "./suppot-email-template";
import { transporter } from "./transporter";


export interface SendSupportEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
}: SendSupportEmailProps) => {
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

  if (!supportEmail) {
    throw new Error("SUPPORT_EMAIL or EMAIL_USER is not configured");
  }

  const html = supportEmailTemplate({
    name,
    email,
    subject,
    message,
  });

  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return transporter.sendMail({
    from: `"Inventory System" <${process.env.EMAIL_USER}>`,

    to: supportEmail,

    cc: process.env.SUPPORT_CC
      ? process.env.SUPPORT_CC.split(",")
      : undefined,

    replyTo: email,

    subject: `[Support] ${subject}`,

    html,

    text: `
SUPPORT REQUEST

Submitted At: ${submittedAt}

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

-----------------------------------
Reply directly to this email to respond to the customer.
    `.trim(),
  });
};