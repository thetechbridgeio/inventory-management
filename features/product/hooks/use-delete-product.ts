import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) =>
      (await axios.delete(`/api/product/${productId}`)).data,

    onSuccess: async (_, productId) => {
      toast.success("Product deleted successfully");

      queryClient.removeQueries({
        queryKey: ["product", productId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}