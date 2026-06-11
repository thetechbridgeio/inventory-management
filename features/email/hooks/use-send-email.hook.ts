// features/support/hooks/use-send-support.ts

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export interface SupportPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SupportResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const useSendSupport = () => {
  return useMutation({
    mutationFn: async (
      payload: SupportPayload,
    ): Promise<SupportResponse> => {
      const { data } = await axios.post<SupportResponse>(
        "/api/email/support",
        payload,
      );

      return data;
    },
  });
};