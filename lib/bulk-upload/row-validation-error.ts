export type RowValidationResult<
  TRow,
  TError extends string = string,
> = {
  rowNumber: number;
  field: keyof TRow;
  error: TError;
  message: string;
};