import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { CreateSupplierFormType } from "../types/suppliers.type";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupplierFormType) =>
      (await axios.post("/api/suppliers", data)).data,

    onSuccess: async () => {
      toast.success("Supplier created successfully");

      await queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
