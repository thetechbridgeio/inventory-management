import { useQuery } from "@tanstack/react-query";
import { GetSuppliersParams } from "../types/suppliers.type";
import axios from "axios";

export function useSuppliers(params: GetSuppliersParams = {}) {
  return useQuery({
    queryKey: ["suppliers", params],

    queryFn: async () =>
      (
        await axios.get("/api/suppliers", {
          params,
        })
      ).data.data,
  });
}
