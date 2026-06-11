// hooks/use-delete-supplier.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      const response = await axios.delete(
        `/api/suppliers/${supplierId}`,
      );

      return response.data;
    },

    onSuccess: (_, supplierId) => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["supplier", supplierId],
      });
    },
  });
}