import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/product/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to delete product");
      }

      return data;
    },

    onSuccess: (_, productId) => {
      queryClient.removeQueries({
        queryKey: ["product", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}