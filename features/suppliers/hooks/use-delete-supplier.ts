import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplierId: string) =>
      (await axios.delete(`/api/suppliers/${supplierId}`)).data,

    onSuccess: async (_, supplierId) => {
      toast.success("Supplier deleted successfully");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suppliers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["supplier", supplierId],
        }),
      ]);
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}