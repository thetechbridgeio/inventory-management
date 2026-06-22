import { db } from "@/db";

import { suppliers } from "../schemas/supplier.schema";
import {
  CreateSupplierFormType,
  CreateSupplierDTO,
} from "../types/suppliers.type";
import { CreateSupplierDTOSchema } from "../validations/suppliers.validation";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function createSupplier(
  data: CreateSupplierFormType,
  companyId: string,
) {
  const dto: CreateSupplierDTO = CreateSupplierDTOSchema.parse({
    companyId,
    companyName: data.companyName,
    contactPersonName: data.contactPersonName ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    description: data.description ?? null,
    gst: data.gst ?? null,
    estimatedDeliveryPeriod: data.estimatedDeliveryPeriod ?? null,
    paymentTerm: data.paymentTerm ?? null,
  });

  try {
    const [supplier] = await db.insert(suppliers).values(dto).returning();

    return supplier;
  } catch (error) {
    mapDatabaseError(error);
  }
}
