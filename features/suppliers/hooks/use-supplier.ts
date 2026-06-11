// hooks/use-supplier.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SupplierDetails } from "../types/supplier-details";


export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],

    queryFn: async () => {
      const response = await axios.get(
        `/api/suppliers/${id}`,
      );

      return response.data.data as SupplierDetails;
    },

    enabled: !!id,
  });
}