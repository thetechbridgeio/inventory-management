"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { CreateProductFormType } from "../types/product.types";
import { buildFormData } from "@/lib/build-payload";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductFormType) => {
      const formData = buildFormData(data);
      const response = await axios.post("/api/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}
