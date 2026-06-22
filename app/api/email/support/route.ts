import { sendSupportEmail } from "@/features/email/service/send-support-email.service";
import { supportSchema } from "@/features/email/validations/support-email.validation";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

export const POST = routeHandler(async (request) => {
  const data = await validateRequest(request, supportSchema);
  await sendSupportEmail(data as any);
});
