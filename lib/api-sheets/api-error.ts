import { NextResponse } from "next/server"

export function handleApiError(error: any, defaultMessage: string) {
  console.error(error)

  let message = defaultMessage
  let status = 500

  if (error.response?.data?.error) {
    const gErr = error.response.data.error
    message = gErr.message

    if (gErr.status === "PERMISSION_DENIED") {
      status = 403
    }
  }

  return NextResponse.json({ error: message }, { status })
}