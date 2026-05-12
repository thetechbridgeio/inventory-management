import { forgotPasswordTemplate } from "../templates/forgot-password-email.template"
import { transporter } from "../transporter"

interface SendForgotPasswordEmailProps {
  name: string
  contactNumber: string
  companyName: string
}

export const sendForgotPasswordEmail = async ({
  name,
  contactNumber,
  companyName,
}: SendForgotPasswordEmailProps) => {
  const html = forgotPasswordTemplate({
    name,
    contactNumber,
    companyName,
  })

  const info = await transporter.sendMail({
    from: `"Inventory Support" <${process.env.EMAIL_USER}>`,

    to: [process.env.EMAIL_USER!, "clienthelp.bgc@gmail.com"],

    subject: "Password Reset Request",

    html,

    text: `
Full Name: ${name}
Contact Number: ${contactNumber}
Company Name: ${companyName}

This user has requested a password reset.
        `,
  })

  return info
}
