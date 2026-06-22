"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { buildFormData } from "@/lib/build-payload";
import { getApiErrorMessage } from "@/lib/api-error";

import { CreateProductFormType } from "../types/product.types";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductFormType) => {
      const formData = buildFormData(data);

      return (
        await axios.post("/api/product", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;
    },

    onSuccess: async () => {
      toast.success("Product created successfully");

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}