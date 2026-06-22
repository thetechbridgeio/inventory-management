import { AuthorizationError } from "./authorization-error";
import { BusinessRuleError } from "./business-rule-error";
import { ConflictError } from "./conflict-error";
import { DatabaseError } from "./database-error";
import { ValidationError } from "./validation-error";

type PostgresError = {
  code?: string;
  detail?: string;
  message?: string;
  constraint?: string;
};

export function mapDatabaseError(error: unknown): never {
  console.error("Database Error:", error);

  const dbError = ((error as { cause?: PostgresError })?.cause ??
    error) as PostgresError;

  switch (dbError.code) {
    // Validation errors
    // Validation errors
    case "22P02":
    case "22003":
    case "22001":
      throw new ValidationError(
        "Please check the information you entered and try again.",
        error,
      );

    // Authorization errors
    case "42501":
      throw new AuthorizationError(
        "You don't have permission to perform this action.",
        error,
      );

    // Conflict errors
    case "23505":
      throw new ConflictError(
        "A record with the same details already exists.",
        error,
      );

    case "23P01":
      throw new ConflictError(
        "This action conflicts with existing data.",
        error,
      );

    // Business rule errors
    case "23503":
      throw new BusinessRuleError("The selected item no longer exists.", error);

    case "23502":
      throw new BusinessRuleError("Please fill in all required fields.", error);

    case "23514":
      throw new BusinessRuleError(
        "The provided information is not valid.",
        error,
      );

    // Infrastructure / database issues
    case "40001":
    case "40P01":
      throw new DatabaseError(
        "Couldn't complete the request. Please try again.",
        error,
      );

    case "08000":
    case "08003":
    case "08006":
      throw new DatabaseError(
        "Unable to connect to the server. Please try again later.",
        error,
      );

    case "57014":
      throw new DatabaseError(
        "The request took too long. Please try again.",
        error,
      );

    case "53300":
      throw new DatabaseError(
        "The system is busy right now. Please try again shortly.",
        error,
      );

    case "42P01":
    case "42703":
    case "42883":
      throw new DatabaseError(
        "Something went wrong on our side. Please try again later.",
        error,
      );

    default:
      throw new DatabaseError(
        "Something went wrong. Please try again later.",
        error,
      );
  }
}
