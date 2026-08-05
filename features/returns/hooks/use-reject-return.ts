"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { returnKeys } from "../query/return-keys";

type RejectSaleReturnPayload = {
  returnId: string;
  rejectionReason?: string | null;
};

export function useRejectSaleReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ returnId, rejectionReason }: RejectSaleReturnPayload) => {
      const response = await axios.put(`/api/returns/${returnId}/reject`, {
        rejectionReason,
      });

      return response.data.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: returnKeys.detail(variables.returnId),
      });
    },
  });
}
