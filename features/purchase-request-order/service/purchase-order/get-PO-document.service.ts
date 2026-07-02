import { db } from "@/db";
import {
  companies,
  products,
  purchaseOrderItems,
  purchaseOrders,
  suppliers,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { PurchaseOrderDocument } from "../../types/purchase-order.type";

export async function getPurchaseOrderDocument(
  purchaseOrderId: string,
  companyId: string,
): Promise<PurchaseOrderDocument> {
  const rows = await db
    .select({
      purchaseOrderId: purchaseOrders.id,
      purchaseOrderNumber: purchaseOrders.purchaseOrderNumber,
      purchaseOrderDate: purchaseOrders.createdAt,
      remarks: purchaseOrders.remarks,
      totalItems: purchaseOrders.totalItems,
      totalOrderedQty: purchaseOrders.totalOrderedQty,

      companyName: companies.name,
      companyAddress: companies.address,
      companyGST: companies.gst,
      companyLogoUrl: companies.logoUrl,
      companyWebsite: companies.website,
      companyContactPersonName: companies.contactPersonName,
      companyContactPersonEmail: companies.contactPersonEmail,
      companyContactPersonPhone: companies.contactPersonPhone,

      supplierCompanyName: suppliers.companyName,
      supplierContactPersonName: suppliers.contactPersonName,
      supplierEmail: suppliers.email,
      supplierPhone: suppliers.phone,
      supplierAddress: suppliers.address,
      supplierGST: suppliers.gst,

      itemId: purchaseOrderItems.id,
      orderedQty: purchaseOrderItems.orderedQty,

      productName: products.name,
      productDescription: products.description,
      productUnit: products.unit,
    })
    .from(purchaseOrders)
    .innerJoin(companies, eq(companies.id, purchaseOrders.companyId))
    .innerJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
    .innerJoin(
      purchaseOrderItems,
      eq(purchaseOrderItems.purchaseOrderId, purchaseOrders.id),
    )
    .innerJoin(products, eq(products.id, purchaseOrderItems.productId))
    .where(
      and(
        eq(purchaseOrders.id, purchaseOrderId),
        eq(purchaseOrders.companyId, companyId),
      ),
    );

  if (rows.length === 0) {
    throw new Error("Purchase Order not found.");
  }

  const first = rows[0];

  return {
    purchaseOrder: {
      id: first.purchaseOrderId,
      number: first.purchaseOrderNumber,
      date: first.purchaseOrderDate,
      remarks: first.remarks,
    },

    company: {
      name: first.companyName,
      address: first.companyAddress,
      gst: first.companyGST,
      logoUrl: first.companyLogoUrl,
      website: first.companyWebsite,
      contactPersonName: first.companyContactPersonName,
      contactPersonEmail: first.companyContactPersonEmail,
      contactPersonPhone: first.companyContactPersonPhone,
    },

    supplier: {
      companyName: first.supplierCompanyName,
      contactPersonName: first.supplierContactPersonName,
      email: first.supplierEmail,
      phone: first.supplierPhone,
      address: first.supplierAddress,
      gst: first.supplierGST,
    },

    items: rows.map((row) => ({
      id: row.itemId,
      productName: row.productName,
      description: row.productDescription,
      unit: row.productUnit,
      orderedQty: row.orderedQty,
    })),

    summary: {
      totalItems: first.totalItems,
      totalOrderedQty: first.totalOrderedQty,
    },
  };
}
