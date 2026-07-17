import { NextRequest } from "next/server";

import { getReceiverEmails } from "@/features/company/service/get-company-user-email.service";
import { AuthorizationError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { sendStockAlertForCompany } from "@/features/company/service/send-stock-alert.service";

export const POST = routeHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthorizationError("Invalid cron secret");
  }
  // const targets = await getReceiverEmails();

  const targets = [
    {
      companyId: "8e962863-f4da-447c-8b7f-4a73b9396c98",
      companyName: "ABC Traders Pvt Ltd",
      companyLogo:
        "https://i.postimg.cc/x83HQ8R7/abstract-logo-design-for-any-corporate-brand-business-company-vector-(1).jpg",
      email: "clienthelp.bgc@gmail.com",
    },
  ];

  // console.log(targets)

  const results = await Promise.allSettled(
    targets.map((target) => sendStockAlertForCompany(target)),
  );

  const summary = results.map((result, index) => ({
    companyId: targets[index].companyId,
    companyName: targets[index].companyName,
    email: targets[index].email,
    status: result.status,
    ...(result.status === "fulfilled"
      ? { value: result.value }
      : { error: String(result.reason) }),
  }));

  return {
    total: targets.length,
    success: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
    summary,
    sentTo: summary
      .filter((item) => item.status === "fulfilled")
      .map((item) => ({
        companyName: item.companyName,
        email: item.email,
      })),
  };
});
