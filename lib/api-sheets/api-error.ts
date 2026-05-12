// lib/api-sheets/api-error.ts

import { NextResponse } from "next/server"

export function handleApiError(error: any, fallbackMessage: string) {
  console.error(error)

  return NextResponse.json(
    {
      success: false,
      error: error?.message || fallbackMessage,
    },
    { status: 500 }
  )
}
