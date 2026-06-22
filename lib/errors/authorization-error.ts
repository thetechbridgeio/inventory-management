import { AppError } from "./app-error";

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", cause?: unknown) {
    super(message, 403, "AUTHORIZATION_ERROR", cause);
  }
}
