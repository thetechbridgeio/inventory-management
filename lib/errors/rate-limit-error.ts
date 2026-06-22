import { AppError } from "./app-error";

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", cause?: unknown) {
    super(message, 429, "RATE_LIMIT_ERROR", cause);
  }
}
