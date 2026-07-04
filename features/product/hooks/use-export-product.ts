"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { GetProductsParams } from "../types/product.types";
import { handleApiError } from "@/lib/errors/handle-api-error";

export function useExportProductsPdf() {
  return useMutation({
    mutationFn: async (filters: GetProductsParams) => {
      try {
        const { data } = await axios.post(
          "/api/product/export",
          filters,
          {
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = url;
        link.download = "inventory-report.pdf";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        handleApiError(error);
      }
    },
  });
}