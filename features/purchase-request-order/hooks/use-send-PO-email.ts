import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type UseSendPurchaseOrderEmailProps = {
  purchaseRequestId: string;
};

export function useSendPurchaseOrderEmail({
  purchaseRequestId,
}: UseSendPurchaseOrderEmailProps) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {
      await axios.post(
        `/api/purchase-orders/${purchaseOrderId}/send-email`,
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "purchase-request",
          purchaseRequestId,
          "purchase-orders",
        ],
      });

      toast.success("Purchase order emailed successfully.");
    },

    onError: () => {
      toast.error("Failed to send purchase order.");
    },
  });
}