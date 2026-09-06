import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { UpdateProfileType } from "../types/user.type";

export function useUpdateProfile() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: UpdateProfileType) =>
      (await axios.patch("/api/me", data)).data,

    onSuccess: () => {
      toast.success("Profile updated successfully");
      router.refresh();
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
