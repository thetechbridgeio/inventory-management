// features/sales/components/sales-search-input.tsx

"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

type Props = {
  value: string

  onChange: (value: string) => void

  placeholder?: string
}

export function SalesSearchInput({
  value,
  onChange,
  placeholder = "Search sales records...",
}: Props) {
  const handleClear = () => {
    onChange("")
  }

  return (
    <div className="relative w-full max-w-sm">
      {/* SEARCH ICON */}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      {/* INPUT */}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-border bg-background pl-10 pr-10 shadow-none transition-all focus-visible:ring-1"
      />

      {/* CLEAR BUTTON */}
      {value.trim() && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
