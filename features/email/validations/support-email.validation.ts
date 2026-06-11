import z from "zod";

export const supportSchema = z.object({
  name: z.string(),
  email: z.email(),
  subject: z.string(),
  message: z.string(),
  website: z.string().optional(), // hidden field
});