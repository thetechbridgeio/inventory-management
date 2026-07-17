import axios from "axios";
import type { Config } from "@netlify/functions";

const { APP_URL, CRON_SECRET } = process.env;

export default async () => {
  if (!APP_URL) {
    console.error(
      "[Low Stock Scheduler] APP_URL environment variable is missing.",
    );

    return new Response(null, { status: 500 });
  }

  if (!CRON_SECRET) {
    console.error(
      "[Low Stock Scheduler] CRON_SECRET environment variable is missing.",
    );

    return new Response(null, { status: 500 });
  }

  const endpoint = `${APP_URL}/api/email/low-stock`;

  console.log(`[Low Stock Scheduler] Started at ${new Date().toISOString()}`);

  try {
    const response = await axios.post(endpoint, undefined, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
      timeout: 30_000,
    });

    console.log("[Low Stock Scheduler] Completed successfully.");

    console.log("Emails sent to:");
    response.data.sentTo.forEach(
      (recipient: { companyName: string; email: string }) => {
        console.log(`✓ ${recipient.companyName} (${recipient.email})`);
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[Low Stock Scheduler] Request failed.", {
        status: error.response?.status,
        message: error.message,
        response: error.response?.data,
      });
    } else {
      console.error("[Low Stock Scheduler] Unexpected error.", error);
    }

    return new Response(null, {
      status: 500,
    });
  }
};

export const config: Config = {
  // Every day at 7:00 AM IST (01:30 UTC)
  schedule: "30 1 * * *",
};
