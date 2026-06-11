// features/admin-users/hooks/use-admin-me.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useAdminMe() {
  return useQuery({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin-me");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}