"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { handleApiError } from "@/lib/errors/handle-api-error";
import { ReportMonthOption } from "../utils/monthly-report-range";

export function useDownloadMonthlyReport() {
  return useMutation({
    mutationFn: async (month: ReportMonthOption) => {
      try {
        const { data } = await axios.post(
          "/api/product/monthly-report",
          { year: month.year, month: month.month },
          { responseType: "blob" },
        );

        const url = window.URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = url;
        link.download = `monthly-report-${month.value}.pdf`;

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
