import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SupplierDetails } from "../types/suppliers.type";


export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],

    queryFn: async () =>
      (
        await axios.get(`/api/suppliers/${id}`)
      ).data.data as SupplierDetails,

    enabled: Boolean(id),
  });
}