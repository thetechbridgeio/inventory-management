import { eq } from "drizzle-orm";

import { db } from "@/db";
import { transporter } from "@/features/email/service/transporter";
import { getStockAlertData } from "@/features/dashboard/service/helpers/get-stock-alert-data";
import { generateStockAlertPDF } from "@/features/dashboard/service/helpers/generate-stock-alert-pdf";
import { companies } from "../schemas/company.schema";
import { stockAlertEmailTemplate } from "./build-stock-alert-email.service";

export type StockAlertContent = {
  subject: string;
  html: string;
  pdf: Buffer;
};

function toISTDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export async function wasStockAlertAlreadySentToday(
  companyId: string,
): Promise<boolean> {
  const [company] = await db
    .select({ lastLowStockAlertSentAt: companies.lastLowStockAlertSentAt })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company?.lastLowStockAlertSentAt) return false;

  return (
    toISTDateString(company.lastLowStockAlertSentAt) ===
    toISTDateString(new Date())
  );
}

export async function markStockAlertSentToday(
  companyId: string,
): Promise<void> {
  await db
    .update(companies)
    .set({ lastLowStockAlertSentAt: new Date() })
    .where(eq(companies.id, companyId));
}

export async function buildStockAlertForCompany(
  companyId: string,
  companyName: string,
  companyLogo: string | null,
): Promise<
  | { shouldSend: false; reason: string }
  | ({ shouldSend: true } & StockAlertContent)
> {
  const data = await getStockAlertData(companyId);

  if (data.outOfStockCount === 0 && data.lowStockCount === 0) {
    return { shouldSend: false, reason: "No low or out-of-stock products" };
  }

  const { subject, html } = stockAlertEmailTemplate(data);
  const pdf = await generateStockAlertPDF(data, { companyName, companyLogo });

  return { shouldSend: true, subject, html, pdf };
}

export async function sendStockAlertEmail(
  email: string,
  content: StockAlertContent,
): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: content.subject,
    html: content.html,
    attachments: [
      {
        filename: `Stock-Alert-${new Date().toISOString().slice(0, 10)}.pdf`,
        content: content.pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
