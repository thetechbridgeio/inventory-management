import { AppError } from "./app-error";

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", cause?: unknown) {
    super(message, 500, "DATABASE_ERROR", cause);
  }
}
