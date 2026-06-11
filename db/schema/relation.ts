import { relations } from "drizzle-orm";

import {
  companies,
  products,
  productSuppliers,
  purchaseItems,
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
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  purchases: many(purchases),
  sales: many(sales),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  company: one(companies, {
    fields: [suppliers.companyId],
    references: [companies.id],
  }),
  products: many(productSuppliers),
  purchases: many(purchases),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  suppliers: many(productSuppliers),
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
    salesItems: many(saleItems)
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
