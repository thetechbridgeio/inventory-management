import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type GetSuppliersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | null;
  estimatedDeliveryPeriod?: number;
  createdFrom?: string;
  createdTo?: string;
};

export function useSuppliers(
  params: GetSuppliersParams = {},
) {
  return useQuery({
    queryKey: ["suppliers", params],

    queryFn: async () => {
      const { data } = await axios.get(
        "/api/suppliers",
        {
          params,
        },
      );

      return data.data;
    },
  });
}