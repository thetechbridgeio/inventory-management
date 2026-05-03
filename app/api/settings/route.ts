import { type NextRequest, NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { handleApiError } from "@/lib/api-sheets/api-error"

const SHEET_NAME = "Settings"

// You should define a structure for settings
const DEFAULT_HEADERS = ["Key", "Value"]

// Optional: normalize into key-value object
function mapSettings(rows: any[]) {
  const obj: Record<string, any> = {}

  rows.forEach((row) => {
    if (!row.key) return
    obj[row.key] = row.value ?? ""
  })

  return obj
}

export async function GET(request: NextRequest) {
  try {
    const sheetId = await getSheetId(request)

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID not configured or client invalid" },
        { status: 400 }
      )
    }

    // Ensure settings sheet exists (optional but recommended)
    await ensureSheetExists(sheetId, SHEET_NAME, DEFAULT_HEADERS)

    const data = await getSheetData(sheetId, SHEET_NAME)

    // Convert array → object (important)
    const settings = mapSettings(data)

    return NextResponse.json({ settings })
  } catch (error) {
    return handleApiError(error, "Failed to fetch settings")
  }
}