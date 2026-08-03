import axios from "axios";
import type { Config } from "@netlify/functions";

const { APP_URL, CRON_SECRET } = process.env;

export default async () => {
  if (!APP_URL) {
    console.error(
      "[Low Stock WhatsApp Scheduler] APP_URL environment variable is missing.",
    );

    return new Response(null, { status: 500 });
  }

  if (!CRON_SECRET) {
    console.error(
      "[Low Stock WhatsApp Scheduler] CRON_SECRET environment variable is missing.",
    );

    return new Response(null, { status: 500 });
  }

  const endpoint = `${APP_URL}/api/whatsapp/low-stock`;

  console.log(
    `[Low Stock WhatsApp Scheduler] Started at ${new Date().toISOString()}`,
  );

  try {
    const response = await axios.post(endpoint, undefined, {
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
      timeout: 60_000,
    });

    const result = response.data?.data;

    console.log(
      `[Low Stock WhatsApp Scheduler] Completed: ${result?.sentCount ?? 0} sent, ` +
        `${result?.skippedCount ?? 0} skipped, ${result?.failedCount ?? 0} failed ` +
        `(${result?.totalCompanies ?? 0} companies).`,
    );

    const summary: Array<{
      companyName: string;
      phone: string;
      status: "sent" | "skipped" | "failed";
      reason?: string;
    }> = result?.summary ?? [];

    summary.forEach(({ companyName, phone, status, reason }) => {
      if (status === "sent") {
        console.log(`✓ sent — ${companyName} <${phone}>`);
      } else if (status === "skipped") {
        console.log(`- skipped — ${companyName} <${phone}> (${reason})`);
      } else {
        console.error(`✗ FAILED — ${companyName} <${phone}>: ${reason}`);
      }
    });

    if ((result?.failedCount ?? 0) > 0) {
      console.error(
        `[Low Stock WhatsApp Scheduler] ${result.failedCount} message(s) failed to send — see FAILED lines above.`,
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[Low Stock WhatsApp Scheduler] Request failed.", {
        status: error.response?.status,
        message: error.message,
        response: error.response?.data,
      });
    } else {
      console.error("[Low Stock WhatsApp Scheduler] Unexpected error.", error);
    }

    return new Response(null, {
      status: 500,
    });
  }
};

export const config: Config = {
  // Every day at 7:00 AM IST (01:30 UTC) — same time as the low-stock email scheduler
  schedule: "30 1 * * *",
};
