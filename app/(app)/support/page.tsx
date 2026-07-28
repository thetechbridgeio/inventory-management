// app/support/page.tsx

import { FAQSection } from "@/components/support/faq-section"
import { SupportContactCard } from "@/components/support/support-contact-card"
import { SupportForm } from "@/components/support/support-form"

export default function SupportPage() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
          <p className="mt-2 text-muted-foreground">
            Need assistance? Contact our support team or explore frequently
            asked questions.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SupportForm />

          <div className="space-y-6">
            <FAQSection />

            <SupportContactCard />
          </div>
        </div>
      </div>
  )
}
