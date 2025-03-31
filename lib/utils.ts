import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStockStatus(item: { stock: number; minimumQuantity: number; maximumQuantity: number }): string {
  if (item.stock < 0) {
    return "negative"
  } else if (item.stock < item.minimumQuantity) {
    return "low"
  } else if (item.stock > item.maximumQuantity) {
    return "excess"
  } else {
    return "normal"
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  try {
    // Create a new date object from the string
    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString // Return the original string if invalid
    }

    // Format the date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    return dateString // Return the original string on error
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

/**
 * Validates and normalizes a date string to YYYY-MM-DD format
 * @param dateString The date string to validate
 * @param fallbackToToday Whether to return today's date if invalid
 * @returns A normalized date string or null if invalid and fallback is false
 */
export function validateAndFormatDate(dateString: string, fallbackToToday = false): string | null {
  if (!dateString) {
    return fallbackToToday ? new Date().toISOString().split("T")[0] : null
  }

  try {
    // If it's already in YYYY-MM-DD format, validate and return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return dateString
      }
    }

    // Try to parse the date
    const dateObj = new Date(dateString)

    // Check if it's a valid date
    if (isNaN(dateObj.getTime())) {
      return fallbackToToday ? new Date().toISOString().split("T")[0] : null
    }

    // Check if the date is suspiciously in the future (more than a year from now)
    const today = new Date()
    if (dateObj > today && dateObj.getFullYear() > today.getFullYear() + 1) {
      // Try to fix common date format issues
      const dateParts = dateString.split(/[-/\s]/)
      if (dateParts.length >= 3) {
        // Try to reconstruct the date with a reasonable year
        let month, day, year

        // Handle various formats: MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD
        if (Number.parseInt(dateParts[0]) > 1000) {
          // Likely YYYY/MM/DD format
          year = Number.parseInt(dateParts[0], 10)
          month = Number.parseInt(dateParts[1], 10)
          day = Number.parseInt(dateParts[2], 10)
        } else if (Number.parseInt(dateParts[2]) < 100) {
          // 2-digit year
          month = Number.parseInt(dateParts[0], 10)
          day = Number.parseInt(dateParts[1], 10)
          year = Number.parseInt(dateParts[2], 10) + 2000
        } else {
          // Standard MM/DD/YYYY or DD/MM/YYYY
          // For simplicity, we'll assume MM/DD/YYYY
          month = Number.parseInt(dateParts[0], 10)
          day = Number.parseInt(dateParts[1], 10)
          year = Number.parseInt(dateParts[2], 10)
        }

        // Validate components
        if (month > 12) {
          // Might be DD/MM/YYYY instead
          const temp = month
          month = day
          day = temp
        }

        // Create a new date with these parts
        const fixedDate = new Date(year, month - 1, day)

        if (!isNaN(fixedDate.getTime())) {
          return fixedDate.toISOString().split("T")[0]
        }
      }

      return fallbackToToday ? new Date().toISOString().split("T")[0] : null
    }

    // Return the date in YYYY-MM-DD format
    return dateObj.toISOString().split("T")[0]
  } catch (error) {
    return fallbackToToday ? new Date().toISOString().split("T")[0] : null
  }
}

