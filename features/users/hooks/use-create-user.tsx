// hooks/use-create-user.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateUserType } from "../types/user.type";


export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateUserType,
    ) => {
    
      const response = await axios.post(
        "/api/users",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}