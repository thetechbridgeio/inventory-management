import { Inventory } from "@/features/inventory/types/inventory.types"
import { lowStockAlertTemplate } from "../templates/low-stock-alert.template"
import { transporter } from "../transporter"

interface SendLowStockAlertProps {
  companyName: string
  email: string
  products: Inventory[]
}

export const sendLowStockAlert = async ({
  companyName,
  email,
  products,
}: SendLowStockAlertProps) => {
  const html = lowStockAlertTemplate({
    companyName,
    products,
  })

  const info = await transporter.sendMail({
    from: `"Inventory Alerts" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: `Low Stock Alert (${products.length} Items)`,

    html,

    text: `
Low Stock Alert

Company: ${companyName}

Products:
${products.map((item) => `- ${item.product} (${item.stock})`).join("\n")}
        `,
  })

  return info
}
