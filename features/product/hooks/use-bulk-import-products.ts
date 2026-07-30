"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useBulkImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();

      formData.append("file", file);

      const { data } = await axios.post("/api/product/import", formData);

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}
