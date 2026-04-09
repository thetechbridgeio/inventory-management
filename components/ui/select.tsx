"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleSelectItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
}

interface SimpleSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

function isSelectItem(child: React.ReactNode): child is React.ReactElement<SimpleSelectItemProps> {
  return (
    React.isValidElement<SimpleSelectItemProps>(child) &&
    (child.type as React.FC & { displayName?: string }).displayName === "SimpleSelectItem"
  )
}

export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  children,
  className,
  disabled,
}) => {
  const onValueChangeRef = React.useRef(onValueChange)
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChangeRef.current?.(e.target.value)
  }

  React.useEffect(() => {
    if (value || !children) return

    const first = React.Children.toArray(children)
      .filter(isSelectItem)
      .find((child) => !child.props.disabled && Boolean(child.props.value))

    if (first) {
      onValueChangeRef.current?.(first.props.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, children])

  const options = React.Children.toArray(children).filter(isSelectItem)

  return (
    <div className={cn("relative", className)}>
      <select
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        )}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((child) => (
          <option
            key={child.props.value}
            value={child.props.value}
            disabled={child.props.disabled}
          >
            {child.props.children}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
}

SimpleSelect.displayName = "SimpleSelect"

export const SimpleSelectItem: React.FC<SimpleSelectItemProps> = () => null

SimpleSelectItem.displayName = "SimpleSelectItem"