import { getDashboardStats } from "@/features/dashboard/service/get-dashboard-stats";
import { transporter } from "@/features/email/service/transporter";
import { DashboardStats, LowStockEmail } from "@/features/dashboard/types";
import { stockAlertEmailTemplate } from "./build-stock-alert-email.service";
import { generateStockAlertPDF } from "@/features/dashboard/service/helpers/generate-stock-alert-pdf";

export async function sendStockAlertForCompany(target: {
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  email: string;
}) {
  const { companyId, companyName, companyLogo, email: recipientEmail } = target;
  const stats: DashboardStats = await getDashboardStats(companyId);

  if (stats.outOfStockCount === 0 && stats.lowStockCount === 0) {
    return { skipped: true, reason: "No alerts to send", companyId };
  }

  const data: LowStockEmail = {
    lowStockProducts: stats.lowStockProducts,
    lowStockCount: stats.lowStockCount,
    outOfStockProducts: stats.outOfStockProducts,
    outOfStockCount: stats.outOfStockCount,
  };

  const { subject, html } = stockAlertEmailTemplate(data);

  const pdf = await generateStockAlertPDF(data, { companyName, companyLogo });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject,
    html,
    attachments: [
      {
        filename: `Stock-Alert-${new Date().toISOString().slice(0, 10)}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return { skipped: false, sentTo: recipientEmail, companyId };
}
