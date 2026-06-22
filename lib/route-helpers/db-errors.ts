import { AppError } from "./errors";

type PgError = { code: string; message: string; constraint?: string };

function isPgError(error: unknown): error is PgError {
  return typeof error === "object" && error !== null && "code" in error;
}

/**
 * Maps a caught database error to an AppError with a safe, client-facing
 * message and an appropriate HTTP status. Always throws — never returns.
 *
 * @param error   The caught error (unknown type, narrowed inside)
 * @param context A short label identifying where the error occurred,
 *                 e.g. "createSupplier" — used only in the thrown message,
 *                 never exposes raw driver internals.
 */
export function handleDbError(error: unknown, context: string): never {
  if (isPgError(error)) {
    switch (error.code) {
      case "23505": // unique_violation
        throw new AppError(
          `${context}: a record with this value already exists`,
          409,
        );
      case "23503": // foreign_key_violation
        throw new AppError(`${context}: referenced record does not exist`, 400);
      case "23502": // not_null_violation
        throw new AppError(`${context}: a required field is missing`, 400);
      case "22P02": // invalid_text_representation (bad UUID, enum, etc.)
        throw new AppError(`${context}: invalid input format`, 400);
      default:
        console.error(
          `Unhandled DB error [${error.code}] in ${context}:`,
          error,
        );
        throw new AppError(`${context}: a database error occurred`, 500);
    }
  }

  console.error(`Unknown error in ${context}:`, error);
  throw new AppError(`${context}: an unexpected error occurred`, 500);
}
