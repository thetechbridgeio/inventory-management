import axios from "axios";
import type { Config } from "@netlify/functions";

export const handler = async () => {
  try {
    const { data } = await axios.post(
      `${process.env.APP_URL}/api/email/low-stock`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    console.log(data);

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
  schedule: "30 1 * * *", // 7:00 AM IST
};