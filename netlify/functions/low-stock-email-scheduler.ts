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
      timeout: 60_000,
    });

    const result = response.data?.data;

    console.log(
      `[Low Stock Scheduler] Completed: ${result?.sentCount ?? 0} sent, ` +
        `${result?.skippedCount ?? 0} skipped, ${result?.failedCount ?? 0} failed ` +
        `(${result?.totalCompanies ?? 0} companies).`,
    );

    const summary: Array<{
      companyName: string;
      email: string;
      status: "sent" | "skipped" | "failed";
      reason?: string;
    }> = result?.summary ?? [];

    summary.forEach(({ companyName, email, status, reason }) => {
      if (status === "sent") {
        console.log(`✓ sent — ${companyName} <${email}>`);
      } else if (status === "skipped") {
        console.log(`- skipped — ${companyName} <${email}> (${reason})`);
      } else {
        console.error(`✗ FAILED — ${companyName} <${email}>: ${reason}`);
      }
    });

    if ((result?.failedCount ?? 0) > 0) {
      console.error(
        `[Low Stock Scheduler] ${result.failedCount} email(s) failed to send — see FAILED lines above.`,
      );
    }
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
