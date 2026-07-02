import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function useExportPurchaseOrder() {
  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {
      const response = await axios.get(
        `/api/purchase-orders/${purchaseOrderId}/export`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);

      const contentDisposition = response.headers["content-disposition"];

      let filename = "purchase-order.pdf";

      const match = contentDisposition?.match(/filename="?([^"]+)"?/);

      if (match) {
        filename = match[1];
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },

    onSuccess: () => {
      toast.success("Purchase order exported successfully.");
    },

    onError: () => {
      toast.error("Failed to export purchase order.");
    },
  });
}