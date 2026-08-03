import { NextRequest } from "next/server";

import { deleteUser } from "@/features/users/service/delete-user-soft.service";
import { updateUserRole } from "@/features/users/service/update-user-role.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: Props,
) {
  const { userId } = await params;

  return routeHandler(async () => {
    const { companyId, role } = await getCurrentUser();

    assertPermission(role, "user:delete");

    return deleteUser(
      userId,
      companyId,
    );
  })(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: Props,
) {
  const { userId } = await params;

  return routeHandler(async (req) => {
    const { companyId, role } = await getCurrentUser();

    assertPermission(role, "user:update-role");

    const { role: newRole } = await req.json();

    return updateUserRole(
      userId,
      companyId,
      newRole,
    );
  })(request);
}
