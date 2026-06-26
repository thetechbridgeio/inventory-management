import { NextRequest } from "next/server";

import { getReceiverEmails } from "@/features/company/service/get-company-user-email.service";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { sendStockAlertForCompany } from "@/features/company/service/send-stock-alert.service";

export const POST = routeHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthorizationError("Invalid cron secret");
  }
  const targets = await getReceiverEmails();

  // const targets = [{
  //     companyId: "df55baa7-5478-42bf-9fcf-29d20185fe61",
  //     companyName: "Ecospace",
  //     companyLogo: "https://i.postimg.cc/jSDN8gLY/ecospace-furniture.jpg",
  //     email: "clienthelp.bgc@gmail.com"
  // }]

  const results = await Promise.allSettled(
    targets.map((target) => sendStockAlertForCompany(target)),
  );

  const summary = results.map((result, index) => ({
    companyId: targets[index].companyId,
    status: result.status,
    ...(result.status === "fulfilled"
      ? { value: result.value }
      : { error: String(result.reason) }),
  }));

  return {
    summary,
    total: targets.length,
    success: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  };
});
