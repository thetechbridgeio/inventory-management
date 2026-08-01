export function passwordResetEmailTemplate(actionLink: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Reset your InventoryEdge password";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reset your password</title>
</head>
<body style="margin:0;padding:30px;background:#f3f4f6;font-family:Arial,sans-serif;">

<table width="500" align="center" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#1f2937;padding:24px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;">🔐 InventoryEdge</h1>
</td>
</tr>

<tr>
<td style="padding:30px;text-align:center;">
<h2 style="margin:0 0 12px;color:#111827;font-size:18px;">Reset your password</h2>
<p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
We received a request to reset the password for your InventoryEdge account. Click the button below to choose a new password. This link will expire in 1 hour.
</p>

<a href="${actionLink}"
style="display:inline-block;background:#1f2937;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">
Reset Password
</a>

<p style="color:#9ca3af;font-size:13px;margin-top:28px;">
If you didn't request this, you can safely ignore this email — your password will remain unchanged.
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

  const text = `
Reset your InventoryEdge password

We received a request to reset the password for your InventoryEdge account.
Open the link below to choose a new password. This link will expire in 1 hour.

${actionLink}

If you didn't request this, you can safely ignore this email — your password will remain unchanged.
  `.trim();

  return { subject, html, text };
}
