import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProcessOrderUpdatePayload } from "../types/process-order.types";
import { ApiErrorResponse } from "@/lib/common-types";


export function useUpdateProcessOrder(id:string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProcessOrderUpdatePayload) => {
      const { data } = await axios.put(
        `/api/process-order/${id}`,
        payload
      );

      return data;
    },

    onSuccess: () => {
      toast.success("Process order updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["process-orders"],
      });
    },

    onError: (error) => {
      console.log(error)
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        toast.error(
          error.response?.data?.error?.message ??
            "Failed to update process order."
        );
        return;
      }

      toast.error("Something went wrong.");
    },
  });
}