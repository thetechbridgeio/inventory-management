import { z } from "zod";

export const optionalField = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? undefined
        : value,
    schema.optional(),
  );