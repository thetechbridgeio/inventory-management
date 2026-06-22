export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly cause?: unknown;

  protected constructor(
    message: string,
    statusCode: number,
    code: string,
    cause?: unknown
  ) {
    super(message);

    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.cause = cause;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
