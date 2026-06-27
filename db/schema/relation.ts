import { relations } from "drizzle-orm";

import {
  companies,
  products,
  productSuppliers,
  purchaseItems,
  purchaseRequestItems,
  purchaseRequests,
  purchases,
  saleItems,
  sales,
  suppliers,
  users,
} from "@/db/schema";

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  suppliers: many(suppliers),
  products: many(products),
  productSuppliers: many(productSuppliers),
  purchases: many(purchases),
  sales: many(sales),
  purchaseRequests: many(purchaseRequests),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),

  purchases: many(purchases),
  sales: many(sales),

  createdPurchaseRequests: many(purchaseRequests, {
    relationName: "purchaseRequestCreatedBy",
  }),

  approvedPurchaseRequests: many(purchaseRequests, {
    relationName: "purchaseRequestApprovedBy",
  }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  company: one(companies, {
    fields: [suppliers.companyId],
    references: [companies.id],
  }),

  products: many(productSuppliers),
  purchases: many(purchases),

  purchaseRequestItems: many(purchaseRequestItems),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),

  suppliers: many(productSuppliers),

  purchaseRequestItems: many(purchaseRequestItems),
}));

export const productSuppliersRelations = relations(
  productSuppliers,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productSuppliers.productId],
      references: [products.id],
    }),

    supplier: one(suppliers, {
      fields: [productSuppliers.supplierId],
      references: [suppliers.id],
    }),
    purchaseItems: many(purchaseItems),
    salesItems: many(saleItems),
  }),
);

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  company: one(companies, {
    fields: [purchases.companyId],
    references: [companies.id],
  }),

  supplier: one(suppliers, {
    fields: [purchases.supplierId],
    references: [suppliers.id],
  }),

  createdByUser: one(users, {
    fields: [purchases.createdBy],
    references: [users.id],
  }),

  items: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id],
  }),

  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales.companyId],
    references: [companies.id],
  }),

  createdByUser: one(users, {
    fields: [sales.createdBy],
    references: [users.id],
  }),

  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),

  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const purchaseRequestRelations = relations(
  purchaseRequests,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [purchaseRequests.companyId],
      references: [companies.id],
    }),

    createdBy: one(users, {
      fields: [purchaseRequests.createdByUserId],
      references: [users.id],
      relationName: "purchaseRequestCreatedBy",
    }),

    approvedBy: one(users, {
      fields: [purchaseRequests.approvedByUserId],
      references: [users.id],
      relationName: "purchaseRequestApprovedBy",
    }),

    items: many(purchaseRequestItems),
  }),
);

export const purchaseRequestItemRelations = relations(
  purchaseRequestItems,
  ({ one }) => ({
    purchaseRequest: one(purchaseRequests, {
      fields: [purchaseRequestItems.purchaseRequestId],
      references: [purchaseRequests.id],
    }),

    product: one(products, {
      fields: [purchaseRequestItems.productId],
      references: [products.id],
    }),

    supplier: one(suppliers, {
      fields: [purchaseRequestItems.supplierId],
      references: [suppliers.id],
    }),
  }),
);
