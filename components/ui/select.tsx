"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  children,
  className,
  disabled,
}) => {
  // Use a native select element instead of a custom dropdown
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value)
    }
  }

  // Ensure we have a valid value
  React.useEffect(() => {
    // If no value is set and we have children, set the first non-disabled option as the value
    if (!value && children && onValueChange) {
      // Find the first non-disabled option
      const options = React.Children.toArray(children).filter(
        (child) =>
          React.isValidElement(child) && child.type === SimpleSelectItem && !child.props.disabled && child.props.value,
      ) as React.ReactElement[]

      if (options.length > 0) {
        onValueChange(options[0].props.value)
      }
    }
  }, [value, children, onValueChange])

  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ""}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        )}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SimpleSelectItem) {
            return (
              <option value={child.props.value || ""} disabled={child.props.disabled}>
                {child.props.children}
              </option>
            )
          }
          return null
        })}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
}

interface SimpleSelectItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
}

export const SimpleSelectItem: React.FC<SimpleSelectItemProps> = ({ value, children, disabled }) => {
  // This component doesn't render anything on its own
  // It's just used as a way to define options for the SimpleSelect
  return null
}

