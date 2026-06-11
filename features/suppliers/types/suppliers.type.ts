import z from "zod";
import { supplierSchema } from "../validations/suppliers.validation";
import { suppliers } from "../schemas/supplier.schema";

export type CreateSupplierFormType = z.infer<typeof supplierSchema>

export type NewSupplier = typeof suppliers.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;