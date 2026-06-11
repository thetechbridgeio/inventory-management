import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCompany() {
  return useQuery({
    queryKey: ["company"],

    queryFn: async () => {
      const { data } = await axios.get(
        "/api/company/current-company",
      );

      return data.data;
    },
  });
}