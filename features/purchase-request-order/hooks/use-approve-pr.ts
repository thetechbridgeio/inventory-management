import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { PurchaseRequestApprovalItemFormType } from "../types/purchase-request.type";

type ApprovePurchaseRequestPayload = {
  purchaseRequestId: string;
  items: PurchaseRequestApprovalItemFormType[];
};

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      purchaseRequestId,
      items,
    }: ApprovePurchaseRequestPayload) => {
      const { data } = await axios.put(
        `/api/purchase-request/${purchaseRequestId}`,
        items,
      );

      return data;
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.purchaseRequestId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["purchase-requests"],
      });

      toast.success("Purchase Request approved successfully.");
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to approve Purchase Request.",
        );
        return;
      }

      toast.error("Something went wrong.");
    },
  });
}