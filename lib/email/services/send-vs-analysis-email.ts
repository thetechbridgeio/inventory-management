import { Inventory } from "@/features/inventory/types/inventory.types"
import { vcAnalysisTemplate } from "../templates/vc-analysis-email.template"
import { transporter } from "../transporter"

interface SendVCAnalysisProps {
  companyName: string
  email: string

  hvhv: Inventory[]
  hvlv: Inventory[]
  lvhv: Inventory[]
  lvlv: Inventory[]
}

export const sendVCAnalysis = async ({
  companyName,
  email,

  hvhv,
  hvlv,
  lvhv,
  lvlv,
}: SendVCAnalysisProps) => {
  const html = vcAnalysisTemplate({
    companyName,

    hvhv,
    hvlv,
    lvhv,
    lvlv,
  })

  await transporter.sendMail({
    from: `"Inventory Reports" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Monthly VC Analysis Report",

    html,
  })
}
