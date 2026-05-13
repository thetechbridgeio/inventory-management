// lib/date.ts

import { format, isValid } from "date-fns"

type DateFormatOptions = {
  fallback?: string
  formatString?: string
}

export const formatSafeDate = (value: unknown, options?: DateFormatOptions) => {
  const fallback = options?.fallback ?? "-"

  const formatString = options?.formatString ?? "dd MMM yyyy"

  if (!value) {
    return fallback
  }

  try {
    let parsedDate: Date | null = null

    // Firestore Timestamp
    if (typeof value === "object" && value !== null && "seconds" in value) {
      parsedDate = new Date((value as { seconds: number }).seconds * 1000)
    }

    // Unix / JS timestamp
    else if (typeof value === "number") {
      parsedDate = new Date(value)
    }

    // String date
    else if (typeof value === "string") {
      const sanitizedValue = value.trim()

      if (!sanitizedValue) {
        return fallback
      }

      parsedDate = new Date(sanitizedValue)
    }

    // Already a Date instance
    else if (value instanceof Date) {
      parsedDate = value
    }

    if (!parsedDate || !isValid(parsedDate)) {
      return fallback
    }

    return format(parsedDate, formatString)
  } catch {
    return fallback
  }
}
