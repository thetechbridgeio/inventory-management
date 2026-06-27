import { LowStockEmail } from "@/features/dashboard/types";

export function stockAlertEmailTemplate(data: LowStockEmail): {
  subject: string;
  html: string;
} {
  const { lowStockCount, outOfStockCount } = data;

  const subject =
    outOfStockCount > 0
      ? `Stock Alert: ${outOfStockCount} Out of Stock | ${lowStockCount} Low Stock`
      : `Stock Alert: ${lowStockCount} Low Stock Products`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Stock Alert</title>
</head>
<body style="margin:0;padding:30px;background:#f3f4f6;font-family:Arial,sans-serif;">

<table width="500" align="center" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#1f2937;padding:24px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">📦 Inventory Stock Alert</h1>
</td>
</tr>

<tr>
<td style="padding:30px;text-align:center;">
<p style="color:#374151;font-size:15px;margin-bottom:24px;">
You have <strong>${outOfStockCount}</strong> out-of-stock and <strong>${lowStockCount}</strong> low-stock product(s) requiring attention.
</p>
<p style="color:#6b7280;font-size:14px;">
See the attached PDF report for full details.
</p>
</td>
</tr>

<tr>
<td style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
This is an automated email from your Inventory Management System.
</td>
</tr>

</table>
</body>
</html>
`;

  return { subject, html };
}
