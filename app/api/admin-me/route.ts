// app/api/admin-me/route.ts

import { getCurrentAdminUser } from "@/features/admin-users/service/get-current-admin-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";

export const GET = createRouteHandler(async () => {
  return getCurrentAdminUser();
});