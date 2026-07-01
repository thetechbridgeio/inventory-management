import { ROLES } from "@/features/auth/constants/user-role";
import { getUsersByRole } from "@/features/company/service/get-user-by-role.service";
import { transporter } from "@/features/email/service/transporter";

type NotifyPREmailParams = {
  companyId: string;
  purchaseRequestNumber: string;
  totalItems: number;
  totalRequestedQty: number;
  remarks: string | null;
};

export async function notifyPREmail({
  companyId,
  purchaseRequestNumber,
  totalItems,
  totalRequestedQty,
  remarks,
}: NotifyPREmailParams) {
  try {
    const superAdmins = await getUsersByRole(companyId, ROLES.SUPER_ADMIN);

    if (!superAdmins.length) {
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: superAdmins.map((admin) => admin.email),
      subject: `New Purchase Request ${purchaseRequestNumber} Awaiting Approval`,
      html: `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f3f4f6; padding:32px 16px;">
    <div style="max-width:650px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">

      <div style="background:#dc2626; padding:28px 24px; text-align:center;">
        <img
          src="${process.env.COMPANY_LOGO}"
          alt="Company Logo"
          style="height:56px; margin-bottom:16px;"
        />

        <h2 style="margin:0; color:#ffffff; font-size:24px;">
          New Purchase Request Submitted
        </h2>

        <p style="margin:8px 0 0; color:#fecaca; font-size:14px;">
          Approval Required
        </p>
      </div>

      <div style="padding:32px; color:#374151;">
        <p style="margin-top:0;">Hello,</p>

        <p>
          A new <strong>Purchase Request</strong> has been created and is
          awaiting your approval.
        </p>

        <table style="width:100%; border-collapse:collapse; margin:28px 0;">
          <tr>
            <td style="padding:12px; font-weight:bold; border:1px solid #e5e7eb; background:#f9fafb;">
              Purchase Request No.
            </td>
            <td style="padding:12px; border:1px solid #e5e7eb;">
              ${purchaseRequestNumber}
            </td>
          </tr>

          <tr>
            <td style="padding:12px; font-weight:bold; border:1px solid #e5e7eb; background:#f9fafb;">
              Total Products
            </td>
            <td style="padding:12px; border:1px solid #e5e7eb;">
              ${totalItems}
            </td>
          </tr>

          <tr>
            <td style="padding:12px; font-weight:bold; border:1px solid #e5e7eb; background:#f9fafb;">
              Total Requested Quantity
            </td>
            <td style="padding:12px; border:1px solid #e5e7eb;">
              ${totalRequestedQty}
            </td>
          </tr>

          <tr>
            <td style="padding:12px; font-weight:bold; border:1px solid #e5e7eb; background:#f9fafb;">
              Remarks
            </td>
            <td style="padding:12px; border:1px solid #e5e7eb;">
              ${remarks || "—"}
            </td>
          </tr>
        </table>

        <p>
          Please review this purchase request and take the necessary approval action.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;" />

        <p style="margin:0; color:#6b7280; font-size:13px;">
          This is an automated email from the Inventory Management System.
        </p>
      </div>
    </div>
  </div>
`,
    });
  } catch (error) {
    console.error("Failed to send purchase request notification email:", error);
  }
}
