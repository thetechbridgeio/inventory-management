import axios from "axios";
import type { Config } from "@netlify/functions";

export default async () => {
  try {
    if (!process.env.APP_URL) {
      throw new Error("APP_URL is not defined");
    }

    if (!process.env.CRON_SECRET) {
      throw new Error("CRON_SECRET is not defined");
    }

    console.log("Calling:", `${process.env.APP_URL}/api/email/low-stock`);

    const { data } = await axios.post(
      `${process.env.APP_URL}/api/email/low-stock`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      },
    );
    console.log("Scheduler completed successfully");

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Scheduler failed",
      }),
    };
  }
};


export const config: Config = {
  schedule: "36 15 * * *",
};
