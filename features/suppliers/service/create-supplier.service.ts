import { db } from "@/db";
import { CreateSupplierFormType, NewSupplier } from "../types/suppliers.type";
import { suppliers } from "../schemas/supplier.schema";

export async function createSupplier(
  data: CreateSupplierFormType,
  companyId: string,
) {
  const modifiedData: NewSupplier = {
    ...data,
    estimatedDeliveryPeriod: Number(data.estimatedDeliveryPeriod),
    companyId,
  };

  return await db.insert(suppliers).values(modifiedData).returning();
}
