"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { CreateProductFormType } from "../types/product.types";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateProductFormType,
    ) => {
      const response = await axios.post(
        "/api/product",
        data,
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}