import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ProcessOrderCreatePayload } from "../types/process-order.types";
import { ApiErrorResponse } from "@/lib/common-types";

export function useCreateProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProcessOrderCreatePayload) => {
      const { data } = await axios.post("/api/process-order", payload);
      return data;
    },

    onSuccess: () => {
      toast.success("Process order created successfully.");

      queryClient.invalidateQueries({
        queryKey: ["process-orders"],
      });
    },

    onError: (error) => {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        toast.error(
          error.response?.data?.error?.message ??
            "Failed to create process order."
        );
        return;
      }

      toast.error("Something went wrong.");
    },
  });
}