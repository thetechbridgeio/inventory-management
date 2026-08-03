import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { UserRole } from "../../auth/constants/user-role";

type UpdateUserRoleParams = {
  userId: string;
  role: UserRole;
};

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleParams) =>
      (await axios.patch(`/api/users/${userId}`, { role })).data,

    onSuccess: async () => {
      toast.success("User role updated successfully");

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
