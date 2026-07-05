import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PurchaseOrderListItem } from "../types/purchase-order.type";

type UseGetPurchaseOrdersByPurchaseRequestProps = {
  purchaseRequestId: string;
  enabled?: boolean;
};

export function useGetPurchaseOrdersByPurchaseRequest({
  purchaseRequestId,
  enabled = true,
}: UseGetPurchaseOrdersByPurchaseRequestProps) {
  return useQuery<PurchaseOrderListItem[]>({
    queryKey: ["purchase-request", purchaseRequestId, "purchase-orders"],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: PurchaseOrderListItem[];
      }>(`/api/purchase-request/${purchaseRequestId}/purchase-orders`);

      return data.data;
    },
    enabled: !!purchaseRequestId && enabled,
  });
}
