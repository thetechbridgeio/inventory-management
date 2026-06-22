// lib/api-error.ts

import { AxiosError } from "axios";
import { ApiErrorResponse } from "./common-types";

export function getApiErrorMessage(error: unknown) {
  return (
    (error as AxiosError<ApiErrorResponse>).response?.data?.error?.message ??
    "Something went wrong."
  );
}