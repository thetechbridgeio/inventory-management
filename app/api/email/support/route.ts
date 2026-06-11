import { sendSupportEmail } from "@/features/email/service/send-support-email.service";
import { supportSchema } from "@/features/email/validations/support-email.validation";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";


export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, supportSchema);

  await sendSupportEmail(data as any);

  return {
    message: "Support request submitted successfully",
  };
});