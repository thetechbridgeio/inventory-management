"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDownloadProductTemplate() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/product/import/template");

      if (!response.ok) {
        throw new Error("Failed to download template.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "product-import-template.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download template.",
      );
    },
  });
}
