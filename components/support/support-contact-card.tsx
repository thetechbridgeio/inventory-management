// features/support/components/support-contact-card.tsx

import { Headphones, Mail } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SupportContactCard() {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Direct Contact</CardTitle>

        <CardDescription>
          Reach our support team directly for urgent assistance.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border bg-muted/30 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
              <Mail className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <p className="font-semibold">Support Email</p>

              <p className="text-sm text-muted-foreground">
                clienthelp.bgc@gmail.com
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Headphones className="h-3.5 w-3.5" />
                Average response time: 2-6 hours
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
