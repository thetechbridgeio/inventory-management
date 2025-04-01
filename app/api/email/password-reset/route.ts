import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, contactNumber, companyName } = data

    // Validate required fields
    if (!name || !contactNumber || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "clienthelp.bgc@gmail.com", // Send to the help email
      subject: "Password Reset Request: Inventory Management",
      text: `Name: ${name}\nContact Number: ${contactNumber}\nCompany Name: ${companyName}\n\nThis user has requested a password reset.`,
      html: `
        <h2>Password Reset Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact Number:</strong> ${contactNumber}</p>
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p>This user has requested a password reset.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Password reset request sent successfully",
    })
  } catch (error) {
    console.error("Error sending password reset request:", error)
    return NextResponse.json(
      {
        error: "Failed to send password reset request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

