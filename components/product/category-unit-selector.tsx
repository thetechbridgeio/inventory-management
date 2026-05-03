"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryUnitSelectorProps {
  label: string
  value: string
  options: string[]
  onSelect: (value: string) => void
  onAddNew: (value: string) => void
  placeholder?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryUnitSelector({
  label,
  value,
  options,
  onSelect,
  onAddNew,
  placeholder,
}: CategoryUnitSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newValue, setNewValue] = useState("")

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!newValue.trim()) return
    onAddNew(newValue.trim())
    setIsAddingNew(false)
    setNewValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">{label}</Label>
      <div className="col-span-3 space-y-2">
        {isAddingNew ? (
          <div className="flex gap-2">
            <Input
              placeholder={`Enter new ${label.toLowerCase()}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAddingNew(false)
                setNewValue("")
              }}
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button type="button" onClick={handleAdd} className="h-10">
              Add
            </Button>
          </div>
        ) : (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value || placeholder || `Select ${label.toLowerCase()}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <div className="flex flex-col">
                  <div className="flex items-center border-b p-2">
                    <Input
                      placeholder={`Search ${label.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filtered.length > 0 ? (
                      <div className="flex flex-col py-1">
                        {filtered.map((opt) => (
                          <div
                            key={opt}
                            className={cn(
                              "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              value === opt && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => {
                              onSelect(opt)
                              setOpen(false)
                              setSearchQuery("")
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === opt ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {opt}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No {label.toLowerCase()}s found.
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs flex items-center"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add New {label}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}