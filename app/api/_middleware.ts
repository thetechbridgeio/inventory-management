import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { startScheduler } from "@/lib/scheduler"

// Variable to track if scheduler has been started
let schedulerStarted = false

export function middleware(request: NextRequest) {
  // Start the scheduler only once when the application starts
  if (!schedulerStarted && process.env.NODE_ENV === "production") {
    try {
      startScheduler()
      schedulerStarted = true
      console.log("Scheduler started via middleware")
    } catch (error) {
      console.error("Failed to start scheduler:", error)
    }
  }

  return NextResponse.next()
}

