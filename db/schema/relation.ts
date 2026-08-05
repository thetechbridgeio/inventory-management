import { relations } from "drizzle-orm";

import {
  companies,
  processOrderItems,
  processOrders,
  products,
  productSuppliers,
  purchaseItems,
  purchaseOrderItems,
  purchaseOrders,
  purchaseRequestItems,
  purchaseRequests,
  purchases,
  saleItems,
  saleReturnItems,
  saleReturns,
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
  purchaseOrders: many(purchaseOrders),
  processOrders: many(processOrders),
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

  createdSaleReturns: many(saleReturns, {
    relationName: "saleReturnCreatedBy",
  }),

  approvedSaleReturns: many(saleReturns, {
    relationName: "saleReturnApprovedBy",
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
  purchaseItems: many(purchaseItems),
  saleItems: many(saleItems),
  purchaseOrderItems: many(purchaseOrderItems),
  purchaseRequestItems: many(purchaseRequestItems),
  sentProcessOrderItems: many(processOrderItems, {
    relationName: "sentProduct",
  }),
  receivedProcessOrderItems: many(processOrderItems, {
    relationName: "receivedProduct",
  }),
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
  returns: many(saleReturns),
}));

export const saleItemsRelations = relations(saleItems, ({ one, many }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),

  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),

  returnItems: many(saleReturnItems),
}));

export const saleReturnsRelations = relations(
  saleReturns,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [saleReturns.companyId],
      references: [companies.id],
    }),

    sale: one(sales, {
      fields: [saleReturns.saleId],
      references: [sales.id],
    }),

    createdByUser: one(users, {
      fields: [saleReturns.createdByUserId],
      references: [users.id],
      relationName: "saleReturnCreatedBy",
    }),

    approvedByUser: one(users, {
      fields: [saleReturns.approvedByUserId],
      references: [users.id],
      relationName: "saleReturnApprovedBy",
    }),

    items: many(saleReturnItems),
  }),
);

export const saleReturnItemsRelations = relations(
  saleReturnItems,
  ({ one }) => ({
    saleReturn: one(saleReturns, {
      fields: [saleReturnItems.saleReturnId],
      references: [saleReturns.id],
    }),

    saleItem: one(saleItems, {
      fields: [saleReturnItems.saleItemId],
      references: [saleItems.id],
    }),

    product: one(products, {
      fields: [saleReturnItems.productId],
      references: [products.id],
    }),
  }),
);

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),

    purchaseRequestItem: one(purchaseRequestItems, {
      fields: [purchaseOrderItems.purchaseRequestItemId],
      references: [purchaseRequestItems.id],
    }),

    product: one(products, {
      fields: [purchaseOrderItems.productId],
      references: [products.id],
    }),
  }),
);

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [purchaseOrders.companyId],
      references: [companies.id],
    }),

    purchaseRequest: one(purchaseRequests, {
      fields: [purchaseOrders.purchaseRequestId],
      references: [purchaseRequests.id],
    }),

    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),

    createdBy: one(users, {
      fields: [purchaseOrders.createdByUserId],
      references: [users.id],
    }),

    purchaseOrderItems: many(purchaseOrderItems),
  }),
);

export const purchaseRequestItemsRelations = relations(
  purchaseRequestItems,
  ({ one, many }) => ({
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

    purchaseOrderItems: many(purchaseOrderItems),
  }),
);

export const purchaseRequestsRelations = relations(
  purchaseRequests,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [purchaseRequests.companyId],
      references: [companies.id],
    }),

    createdBy: one(users, {
      fields: [purchaseRequests.createdByUserId],
      references: [users.id],
    }),

    processedBy: one(users, {
      fields: [purchaseRequests.processedByUserId],
      references: [users.id],
    }),

    purchaseRequestItems: many(purchaseRequestItems),

    purchaseOrders: many(purchaseOrders),
  }),
);

export const processOrdersRelations = relations(
  processOrders,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [processOrders.companyId],
      references: [companies.id],
    }),

    items: many(processOrderItems),
  }),
);

export const processOrderItemsRelations = relations(
  processOrderItems,
  ({ one }) => ({
    processOrder: one(processOrders, {
      fields: [processOrderItems.processOrderId],
      references: [processOrders.id],
    }),

    sentProduct: one(products, {
      fields: [processOrderItems.sentProductId],
      references: [products.id],
      relationName: "sentProduct",
    }),

    receivedProduct: one(products, {
      fields: [processOrderItems.receivedProductId],
      references: [products.id],
      relationName: "receivedProduct",
    }),
  }),
);
