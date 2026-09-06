import { NextRequest } from "next/server";
import { handleApiError } from "../errors/handle-api-error";
import { apiResponse } from "./api-response";

export function routeHandler<T>(handler: (request: NextRequest) => Promise<T>) {
  return async (request: NextRequest) => {
    try {
      const data = await handler(request);

      return apiResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
