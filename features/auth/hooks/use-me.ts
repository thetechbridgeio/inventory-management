import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get("/api/me");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}