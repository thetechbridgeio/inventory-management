export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;

    // Maintains correct stack trace (only relevant on V8/Node)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}