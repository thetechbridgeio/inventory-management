import { LowStockEmail, DashboardProduct } from "@/features/dashboard/types";

export function stockAlertEmailTemplate(data: LowStockEmail): {
  subject: string;
  html: string;
} {
  const {
    lowStockCount,
    outOfStockCount,
    lowStockProducts,
    outOfStockProducts,
  } = data;

  const renderRows = (products: DashboardProduct[]) =>
    products
      .map(
        (product) => `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${product.name}</td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;">${product.category}</td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:600;">
              ${product.currentStock}
            </td>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
              ${product.location ?? "-"}
            </td>
          </tr>
        `,
      )
      .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Stock Alert</title>
</head>

<body style="margin:0;padding:30px;background:#f3f4f6;font-family:Arial,sans-serif;">

<table width="700" align="center" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#1f2937;padding:28px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:28px;">
📦 Inventory Stock Alert
</h1>
<p style="margin-top:8px;color:#d1d5db;">
Immediate attention required for inventory levels.
</p>
</td>
</tr>

<tr>
<td style="padding:30px;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td width="48%" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;text-align:center;">
<div style="font-size:42px;font-weight:bold;color:#dc2626;">
${outOfStockCount}
</div>
<div style="font-size:16px;color:#991b1b;">
Out of Stock
</div>
</td>

<td width="4%"></td>

<td width="48%" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:20px;text-align:center;">
<div style="font-size:42px;font-weight:bold;color:#ea580c;">
${lowStockCount}
</div>
<div style="font-size:16px;color:#9a3412;">
Low Stock
</div>
</td>

</tr>
</table>

${
  outOfStockProducts.length
    ? `
<h2 style="margin-top:40px;color:#dc2626;">🚫 Out of Stock Products</h2>

<table width="100%" cellpadding="0" cellspacing="0"
style="border-collapse:collapse;border:1px solid #e5e7eb;">

<thead style="background:#dc2626;color:#ffffff;">
<tr>
<th align="left" style="padding:12px;">Product</th>
<th align="left" style="padding:12px;">Category</th>
<th align="center" style="padding:12px;">Stock</th>
<th align="left" style="padding:12px;">Location</th>
</tr>
</thead>

<tbody>
${renderRows(outOfStockProducts)}
</tbody>

</table>
`
    : ""
}

${
  lowStockProducts.length
    ? `
<h2 style="margin-top:40px;color:#ea580c;">⚠️ Low Stock Products</h2>

<table width="100%" cellpadding="0" cellspacing="0"
style="border-collapse:collapse;border:1px solid #e5e7eb;">

<thead style="background:#f59e0b;color:#ffffff;">
<tr>
<th align="left" style="padding:12px;">Product</th>
<th align="left" style="padding:12px;">Category</th>
<th align="center" style="padding:12px;">Stock</th>
<th align="left" style="padding:12px;">Location</th>
</tr>
</thead>

<tbody>
${renderRows(lowStockProducts)}
</tbody>

</table>
`
    : ""
}

<div style="margin-top:40px;padding:20px;background:#f9fafb;border-left:4px solid #3b82f6;border-radius:8px;">
<strong>Recommended Actions</strong>

<ul style="margin-top:10px;padding-left:20px;color:#4b5563;line-height:1.8;">
<li>Replenish all out-of-stock products immediately.</li>
<li>Create purchase orders for low-stock items.</li>
<li>Review inventory levels and update stock records if required.</li>
</ul>
</div>

</td>
</tr>

<tr>
<td style="background:#f3f4f6;padding:20px;text-align:center;font-size:13px;color:#6b7280;">
This is an automated email from your Inventory Management System.
</td>
</tr>

</table>

</body>
</html>
`;

  const subject =
    outOfStockCount > 0
      ? `Stock Alert: ${outOfStockCount} Out of Stock | ${lowStockCount} Low Stock`
      : `Stock Alert: ${lowStockCount} Low Stock Products`;

  return {
    subject,
    html,
  };
}
