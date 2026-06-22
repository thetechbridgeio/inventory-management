import { AppError } from "./app-error";

export class ExternalServiceError extends AppError {
  constructor(message = "External service failure", cause?: unknown) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", cause);
  }
}
