import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { updateProfile } from "@/features/users/service/update-profile.service";
import { UpdateProfileType } from "@/features/users/types/user.type";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  return getCurrentUser();
});

export const PATCH = routeHandler(async (request) => {
  const { id } = await getCurrentUser();
  const body: UpdateProfileType = await request.json();

  return updateProfile(id, body);
});
