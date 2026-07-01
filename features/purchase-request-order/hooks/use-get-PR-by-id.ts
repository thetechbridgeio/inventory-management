import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { ViewPurchaseRequestType } from "../types/purchase-request.type";

type UseGetPurchaseRequestByIdProps = {
  purchaseRequestId: string;
};

export function useGetPurchaseRequestById({
  purchaseRequestId,
}: UseGetPurchaseRequestByIdProps) {
  return useQuery<ViewPurchaseRequestType>({
    queryKey: ["purchase-request", purchaseRequestId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/purchase-request/${purchaseRequestId}`,
      );

      return data.data;
    },
    enabled: !!purchaseRequestId,
  });
}