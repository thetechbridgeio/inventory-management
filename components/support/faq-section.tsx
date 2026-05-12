// features/support/components/faq-section.tsx

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const faqs = [
  {
    question: "How do I add a new product?",
    answer:
      "Navigate to Settings → Product Settings and create a new product with stock and pricing information.",
  },

  {
    question: "How can I export inventory data?",
    answer:
      "Use the Export option available on Inventory, Purchase, or Sales pages to download reports.",
  },

  {
    question: "How do I manage suppliers?",
    answer:
      "Go to Settings → Supplier Settings to add, edit, or remove suppliers.",
  },

  {
    question: "How do I delete multiple items?",
    answer:
      "Select rows using the checkboxes and use the bulk delete action from the toolbar.",
  },

  {
    question: "How can I update stock quantities?",
    answer:
      "Open the inventory module and edit stock values directly from the product management table.",
  },
]

export function FAQSection() {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>

        <CardDescription>
          Quick answers to common support queries.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
