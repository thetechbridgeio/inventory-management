"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    indeterminate?: boolean
  }
>(({ className, checked, onCheckedChange, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate === true
    }
  }, [indeterminate])

  // Add a useEffect to sync the checked state with the DOM element
  React.useEffect(() => {
    if (innerRef.current && checked !== undefined) {
      innerRef.current.checked = checked
    }
  }, [checked])

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary text-primary-foreground",
          className,
        )}
        onClick={() => {
          if (onCheckedChange) {
            onCheckedChange(!checked)
          }
        }}
      >
        {checked && <Check className="h-3 w-3 text-current" />}
      </div>
      <input
        type="checkbox"
        ref={innerRef}
        checked={checked}
        onChange={(e) => {
          if (onCheckedChange) {
            onCheckedChange(e.target.checked)
          }
        }}
        className="sr-only"
        {...props}
      />
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
