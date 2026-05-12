import { sendForgotPasswordEmail } from "@/lib/email/services/send-forgot-password-email.service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, contactNumber, companyName } = body

    /**
     * Validation
     */
    if (!name?.trim() || !contactNumber?.trim() || !companyName?.trim()) {
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
     * Basic phone validation
     */
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/

    if (!phoneRegex.test(contactNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid contact number",
        },
        {
          status: 400,
        }
      )
    }

    await sendForgotPasswordEmail({
      name: name.trim(),
      contactNumber: contactNumber.trim(),
      companyName: companyName.trim(),
    })

    return NextResponse.json({
      success: true,
      message: "Password reset request submitted successfully",
    })
  } catch (error) {
    console.error("Forgot Password API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit password reset request",
      },
      {
        status: 500,
      }
    )
  }
}
