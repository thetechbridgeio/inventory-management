import { parseUserQueryParams } from "@/features/users/query/user.query";
import { createUser } from "@/features/users/service/create-user.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { getUsers } from "@/features/users/service/get-users.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";

export const GET = createRouteHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);
  const filters = parseUserQueryParams(searchParams);

  return getUsers({
    companyId,
    ...filters,
  });
});

export const POST = createRouteHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const body = await request.json();
  const user = await createUser(body, companyId);

  return user;
});
