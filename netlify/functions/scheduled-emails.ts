import type { Handler } from "@netlify/functions"

// This is a Netlify scheduled function that runs daily at the specified time
const handler: Handler = async (event, context) => {
  try {
    console.log("Netlify scheduled function triggered at:", new Date().toISOString())

    // Call our API endpoint
    const baseUrl = process.env.URL || "https://client-inventory-management.netlify.app"
    const cronSecret = process.env.CRON_SECRET || "default-secret"

    console.log("Calling cron endpoint:", `${baseUrl}/api/cron/daily-emails`)

    const response = await fetch(`${baseUrl}/api/cron/daily-emails`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
    })

    console.log("Cron endpoint response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cron endpoint error:", errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log("Cron endpoint result:", result)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Scheduled emails processed successfully",
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
