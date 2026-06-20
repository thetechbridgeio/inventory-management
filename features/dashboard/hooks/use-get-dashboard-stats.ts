import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DashboardStats } from "../types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],

    queryFn: async () => {
      const response = await axios.get("/api/dashboard");

      return response.data.data as DashboardStats;
    },
  });
}
