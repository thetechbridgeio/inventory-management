"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { GetSaleReturnsParams } from "../types/return.type";
import { handleApiError } from "@/lib/errors/handle-api-error";

export function useExportSaleReturnsPdf() {
  return useMutation({
    mutationFn: async (
      filters: Omit<GetSaleReturnsParams, "page" | "sortOrder">,
    ) => {
      try {
        const { data } = await axios.post("/api/returns/export", filters, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = url;
        link.download = "returns-report.pdf";

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
