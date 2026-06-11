import { deleteUser } from "@/features/users/service/delete-user-soft.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";


type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: Props,
) {
  const { userId } = await params;

  return createRouteHandler(async () => {
    const {companyId} = await getCurrentUser();

    return deleteUser(
      userId,
      companyId,
    );
  })(request as never);
}