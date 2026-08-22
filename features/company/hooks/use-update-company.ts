import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { UpdateCompanyFormType } from "../types/company.type";
import { buildCompanyFormData } from "../utils/build-company-form-data";

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCompanyFormType) => {
      const formData = buildCompanyFormData(data);

      const response = await axios.patch(
        "/api/company/current-company",
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
      toast.success("Company details updated successfully");

      await queryClient.invalidateQueries({
        queryKey: ["company"],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
