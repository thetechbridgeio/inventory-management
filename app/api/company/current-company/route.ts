import { getCompanyById } from "@/features/company/service/get-company.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";

export const GET = createRouteHandler(async () => {
  const { companyId } = await getCurrentUser();
  return getCompanyById(companyId);
});
