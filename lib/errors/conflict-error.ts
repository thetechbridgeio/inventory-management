import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(message = "Resource already exists", cause?: unknown) {
    super(message, 409, "CONFLICT_ERROR", cause);
  }
}