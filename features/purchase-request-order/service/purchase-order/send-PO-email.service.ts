import { transporter } from "@/features/email/service/transporter";
import { generatePurchaseOrderPdf } from "./generate-PO-pdf.service";
import { getPurchaseOrderDocument } from "./get-PO-document.service";
import { updatePurchaseOrderStatus } from "./update-PO-status.service";
import { PURCHASE_ORDER_STATUS } from "../../constants/purchase-order-status";
import { getUsersByRoles } from "@/features/company/service/get-user-by-role.service";
import { ROLES } from "@/features/auth/constants/user-role";

export async function sendPurchaseOrderEmail(
  purchaseOrderId: string,
  companyId: string,
): Promise<void> {
  const document = await getPurchaseOrderDocument(purchaseOrderId, companyId);

  if (!document.supplier.email) {
    throw new Error("Supplier email is not configured.");
  }

  const recipients = await getUsersByRoles(companyId, [
    ROLES.SUPER_ADMIN,
    ROLES.PURCHASE_ADMIN,
    ROLES.OPERATIONS_ADMIN,
  ]);

  const cc = recipients
    .map((user) => user.email)
    .filter((email) => email !== document.supplier.email);

  const pdf = await generatePurchaseOrderPdf(document);

  await transporter.sendMail({
    to: document.supplier.email,
    cc,

    subject: `Purchase Order ${document.purchaseOrder.number}`,

    html: `
      <p>Dear ${
        document.supplier.contactPersonName ?? document.supplier.companyName
      },</p>

      <p>
        Please find attached Purchase Order
        <strong>${document.purchaseOrder.number}</strong>.
      </p>

      <p>
        Kindly acknowledge receipt of this purchase order and
        confirm the expected delivery schedule.
      </p>

      <br />

      <p>Regards,</p>

      <p>
        <strong>${document.company.name}</strong><br />
        ${document.company.contactPersonName ?? ""}<br />
        ${document.company.contactPersonEmail ?? ""}<br />
        ${document.company.contactPersonPhone ?? ""}
      </p>
    `,

    attachments: [
      {
        filename: `${document.purchaseOrder.number}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  await updatePurchaseOrderStatus(
    purchaseOrderId,
    PURCHASE_ORDER_STATUS.EMAIL_SENT,
  );
}
