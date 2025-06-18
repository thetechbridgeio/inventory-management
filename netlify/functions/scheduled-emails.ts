import type { Handler } from "@netlify/functions"

// This is a Netlify scheduled function that runs daily at 6 PM IST (12:30 PM UTC)
const handler: Handler = async (event, context) => {
  try {
    console.log("Netlify scheduled function triggered at:", new Date().toISOString())

    // Call our API endpoint
    const baseUrl = process.env.URL || "https://client-inventory-management.netlify.app"
    const response = await fetch(`${baseUrl}/api/cron/daily-emails`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || "your-secret-key"}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const result = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Scheduled emails sent successfully",
        result,
        timestamp: new Date().toISOString(),
      }),
    }
  } catch (error) {
    console.error("Error in scheduled function:", error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    }
  }
}

export { handler }
