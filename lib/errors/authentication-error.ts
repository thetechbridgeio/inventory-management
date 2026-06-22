import { AppError } from "./app-error";

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", cause?: unknown) {
    super(message, 401, "AUTHENTICATION_ERROR", cause);
  }
}
