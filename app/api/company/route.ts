// app/api/onboarding/route.ts

import { getCompanies } from "@/features/company/service/get-companies.service";
import { onboardCompany } from "@/features/company/service/onboard-company.service";
import { onBoardCompanySchema } from "@/features/company/validations/company.validation";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

export const GET = createRouteHandler(async () => {
  return getCompanies();
});

export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, onBoardCompanySchema);
  return onboardCompany(data);
});
