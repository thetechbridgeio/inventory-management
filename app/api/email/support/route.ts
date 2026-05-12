import { sendSupportEmail } from "@/lib/email/services/send-support-email.service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, subject, message } = body

    /**
     * Validation
     */
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        {
          status: 400,
        }
      )
    }

    /**
     * Basic email validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
        },
        {
          status: 400,
        }
      )
    }

    await sendSupportEmail({
      name,
      email,
      subject,
      message,
    })

    return NextResponse.json({
      success: true,
      message: "Support email sent successfully",
    })
  } catch (error) {
    console.error("Support Email Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send support email",
      },
      {
        status: 500,
      }
    )
  }
}
