"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { returnKeys } from "../query/return-keys";

export function useApproveSaleReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (returnId: string) => {
      const response = await axios.put(`/api/returns/${returnId}/approve`);

      return response.data.data;
    },

    onSuccess: (_, returnId) => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: returnKeys.detail(returnId),
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}
