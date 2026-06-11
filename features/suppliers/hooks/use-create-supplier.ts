import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateSupplierFormType } from "../types/suppliers.type";


export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierFormType) =>
      axios.post("/api/suppliers", data).then((res) => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      }),
  });
}