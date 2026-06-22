import { getDashboardStats } from "@/features/dashboard/service/get-dashboard-stats";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();

  return await getDashboardStats(companyId);
});
