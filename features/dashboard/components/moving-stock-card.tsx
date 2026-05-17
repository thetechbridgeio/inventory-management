"use client"

import { Info } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type ProductItem = {
  product: string
  quantity: number
}

type InventoryOverviewCardProps = {
  title: string
  count: number
  description: string
  color: string
  products: ProductItem[]
}

export default function InventoryOverviewCard({
  title,
  count,
  description,
  color,
  products,
}: InventoryOverviewCardProps) {
  return (
    <div
      className="
        relative overflow-hidden rounded-2xl border border-black/[0.06]
        p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        transition-all duration-300 ease-out
        hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]
        cursor-default
      "
      style={{ backgroundColor: color }}
    >
      {/* Subtle inner gloss highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60" />

      {/* LEFT: count + label */}
      <div className="space-y-2">
        {/* COUNT — dominant visual anchor */}
        <div className="flex justify-between gap-4 items-center">
          <h1
            className="
              text-4xl font-bold tracking-tighter leading-none
              text-foreground/90 tabular-nums
            "
          >
            {count}
          </h1>
          {/* ACTION */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                View
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border border-black/[0.07] shadow-2xl">
              {/* Header */}
              <div className="border-b border-black/[0.06] bg-muted/30 px-6 py-5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground">
                    {title}
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums"
                    >
                      {count}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Product List */}
              <div className="max-h-[400px] overflow-y-auto p-5">
                {products.length > 0 ? (
                  <div className="space-y-2">
                    {products.map((item, index) => (
                      <div
                        key={index}
                        className="
                        flex items-center justify-between
                        rounded-xl border border-black/[0.06]
                        bg-muted/20 px-4 py-3
                        transition-colors duration-150
                        hover:bg-muted/50
                      "
                      >
                        <p className="truncate text-sm font-medium text-foreground/80">
                          {item.product}
                        </p>
                        <span
                          className="
                          ml-3 shrink-0 rounded-lg border border-black/[0.08]
                          bg-background px-2.5 py-0.5
                          text-xs font-semibold tabular-nums text-foreground/60
                        "
                        >
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="
                    flex h-36 items-center justify-center
                    rounded-xl border border-dashed border-black/10
                    text-xs text-muted-foreground
                  "
                  >
                    No products available
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* TITLE + INFO */}
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-foreground/50">
            {title}
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="
                      flex h-4 w-4 items-center justify-center
                      rounded-full border border-black/10
                      bg-black/5 text-foreground/40
                      transition-all duration-150
                      hover:bg-black/10 hover:text-foreground/70
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20
                    "
                >
                  <Info className="h-2.5 w-2.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[220px] text-xs leading-relaxed rounded-xl"
              >
                {description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
