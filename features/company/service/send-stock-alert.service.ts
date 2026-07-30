import { transporter } from "@/features/email/service/transporter";
import { getStockAlertData } from "@/features/dashboard/service/helpers/get-stock-alert-data";
import { generateStockAlertPDF } from "@/features/dashboard/service/helpers/generate-stock-alert-pdf";
import { stockAlertEmailTemplate } from "./build-stock-alert-email.service";

export type StockAlertContent = {
  subject: string;
  html: string;
  pdf: Buffer;
};

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
