import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/common-types";

export function useDeleteProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/process-order/${id}`);
      return data;
    },

    onSuccess: () => {
      toast.success("Process order deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["process-orders"],
      });
    },

    onError: (error) => {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        toast.error(
          error.response?.data?.error?.message ??
            "Failed to delete process order."
        );
        return;
      }

      toast.error("Something went wrong.");
    },
  });
}