import { AppError } from "./app-error";

export class BusinessRuleError extends AppError {
  constructor(message = "Business rule violation", cause?: unknown) {
    super(message, 422, "BUSINESS_RULE_ERROR", cause);
  }
}
