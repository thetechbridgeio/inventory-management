import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserRole } from "../../auth/constants/user-role";

type GetUsersParams = {
  page?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
};

export function useUsers(
  params: GetUsersParams = {},
) {
  return useQuery({
    queryKey: ["users", params],

    queryFn: async () => {
      const { data } = await axios.get(
        "/api/users",
        {
          params,
        },
      );

      return data.data;
    },
  });
}