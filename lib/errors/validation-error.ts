import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", cause?: unknown) {
    super(message, 400, "VALIDATION_ERROR", cause);
  }
}
