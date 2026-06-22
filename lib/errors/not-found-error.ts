import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", cause?: unknown) {
    super(message, 404, "NOT_FOUND", cause);
  }
}
