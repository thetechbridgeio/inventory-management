import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { PurchaseRequestFormType } from "../types/purchase-request.type";

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PurchaseRequestFormType) => {
      const { data } = await axios.post<{
        data: {
          id: string;
        };
      }>("/api/purchase-request", payload);

      return data.data;
    },

    onSuccess: async () => {
      toast.success("Purchase Request created successfully!");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchase-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["purchase-request-products"], // same key used by useGetPRProduct
        }),
      ]);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to create purchase request.",
        );
        return;
      }

      toast.error("Failed to create purchase request.");
    },
  });
}