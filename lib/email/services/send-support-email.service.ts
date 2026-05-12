import { supportEmailTemplate } from "../templates/support-email.template"
import { transporter } from "../transporter"

interface SendSupportEmailProps {
  name: string
  email: string
  subject: string
  message: string
}

export const sendSupportEmail = async ({
  name,
  email,
  subject,
  message,
}: SendSupportEmailProps) => {
  const html = supportEmailTemplate({
    name,
    email,
    subject,
    message,
  })

  const info = await transporter.sendMail({
    from: `"Inventory Support" <${process.env.EMAIL_USER}>`,

    to: [process.env.EMAIL_USER!, "businesscoachakhill@gmail.com"],

    replyTo: email,

    subject: `Support Request: ${subject}`,

    html,

    text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `,
  })

  return info
}
