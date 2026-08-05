"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { UpdateProductFormType } from "../types/product.types";
import { buildProductFormData } from "../utils/build-product-form-data";

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductFormType) => {
      const formData = buildProductFormData(data);

      const response = await axios.put(
        `/api/product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    },

    onSuccess: async () => {
      toast.success("Product updated successfully");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["product", productId],
        }),
      ]);
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}