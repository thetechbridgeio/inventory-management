import "server-only";

import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  sales,
  saleItems,
  purchaseOrders,
  purchaseOrderItems,
  purchaseRequests,
  purchaseRequestItems,
} from "@/db/schema";

import { PURCHASE_REQUEST_ITEM_STATUS } from "@/features/purchase-request-order/constants/purchase-request-item-status";
import { getStockStatus } from "../../components/data-table/get-stock-status";
import { STOCK_STATUSES } from "../../constants/product-stock-status";
import { MonthlyReportData, MonthlyReportRow } from "../../types/monthly-report.type";

const TOP_MOVERS_LIMIT = 20;

const NEEDS_ATTENTION_SEVERITY: Record<string, number> = {
  [STOCK_STATUSES.OUT_OF_STOCK]: 0,
  [STOCK_STATUSES.LOW]: 1,
};

function getMonthDateRange(year: number, month: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1))
    .toISOString()
    .split("T")[0];

  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];

  return { startDate, endDate };
}

export async function getMonthlyReportData(
  companyId: string,
  year: number,
  month: number,
): Promise<MonthlyReportData> {
  const { startDate, endDate } = getMonthDateRange(year, month);

  const [productRows, salesRows, pendingPoRows, pendingIndentRows] =
    await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          category: products.category,
          unit: products.unit,
          minOrderQty: products.minOrderQty,
          maxOrderQty: products.maxOrderQty,
          currentStock: products.currentStock,
        })
        .from(products)
        .where(eq(products.companyId, companyId))
        .orderBy(products.category, products.name),

      db
        .select({
          productId: saleItems.productId,
          soldQty: sql<string>`coalesce(sum(${saleItems.quantity}), 0)`,
          soldValue: sql<string>`coalesce(sum(${saleItems.lineTotal}), 0)`,
        })
        .from(saleItems)
        .innerJoin(sales, eq(sales.id, saleItems.saleId))
        .where(
          and(
            eq(sales.companyId, companyId),
            gte(sales.saleDate, startDate),
            lte(sales.saleDate, endDate),
          ),
        )
        .groupBy(saleItems.productId),

      // Every ordered qty across all Purchase Orders — this app has no
      // goods-receipt link back to POs, so a PO never resolves out of this
      // total; it's a running "total ever ordered" figure, not a live
      // "still awaiting delivery" one.
      db
        .select({
          productId: purchaseOrderItems.productId,
          pendingPoQty: sql<string>`coalesce(sum(${purchaseOrderItems.orderedQty}), 0)`,
        })
        .from(purchaseOrderItems)
        .innerJoin(
          purchaseOrders,
          eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId),
        )
        .where(eq(purchaseOrders.companyId, companyId))
        .groupBy(purchaseOrderItems.productId),

      db
        .select({
          productId: purchaseRequestItems.productId,
          pendingIndentQty: sql<string>`coalesce(sum(${purchaseRequestItems.requestedQty}), 0)`,
        })
        .from(purchaseRequestItems)
        .innerJoin(
          purchaseRequests,
          eq(purchaseRequests.id, purchaseRequestItems.purchaseRequestId),
        )
        .where(
          and(
            eq(purchaseRequests.companyId, companyId),
            inArray(purchaseRequestItems.status, [
              PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL,
              PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED,
            ]),
          ),
        )
        .groupBy(purchaseRequestItems.productId),
    ]);

  const salesByProduct = new Map(salesRows.map((row) => [row.productId, row]));
  const pendingPoByProduct = new Map(
    pendingPoRows.map((row) => [row.productId, row]),
  );
  const pendingIndentByProduct = new Map(
    pendingIndentRows.map((row) => [row.productId, row]),
  );

  const totals = {
    productCount: productRows.length,
    soldQty: 0,
    soldValue: 0,
    pendingPoQty: 0,
    pendingIndentQty: 0,
    lowStockCount: 0,
    omittedCount: 0,
  };

  let activeProductCount = 0;

  const needsAttention: MonthlyReportRow[] = [];
  const topMovers: MonthlyReportRow[] = [];
  const pendingPurchaseOrders: MonthlyReportRow[] = [];
  const pendingIndents: MonthlyReportRow[] = [];

  for (const product of productRows) {
    const soldQty = Number(salesByProduct.get(product.id)?.soldQty ?? 0);
    const soldValue = Number(salesByProduct.get(product.id)?.soldValue ?? 0);
    const pendingPoQty = Number(
      pendingPoByProduct.get(product.id)?.pendingPoQty ?? 0,
    );
    const pendingIndentQty = Number(
      pendingIndentByProduct.get(product.id)?.pendingIndentQty ?? 0,
    );

    const status = getStockStatus(
      product.currentStock,
      product.minOrderQty,
      product.maxOrderQty,
    );

    totals.soldQty += soldQty;
    totals.soldValue += soldValue;
    totals.pendingPoQty += pendingPoQty;
    totals.pendingIndentQty += pendingIndentQty;

    const isLowOrOutOfStock =
      status === STOCK_STATUSES.OUT_OF_STOCK || status === STOCK_STATUSES.LOW;

    if (isLowOrOutOfStock) totals.lowStockCount += 1;

    const row: MonthlyReportRow = {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      currentStock: product.currentStock,
      status,
      soldQty,
      soldValue,
      pendingPoQty,
      pendingIndentQty,
    };

    const isActive =
      isLowOrOutOfStock || soldQty > 0 || pendingPoQty > 0 || pendingIndentQty > 0;

    if (isActive) activeProductCount += 1;
    if (isLowOrOutOfStock) needsAttention.push(row);
    if (soldQty > 0) topMovers.push(row);
    if (pendingPoQty > 0) pendingPurchaseOrders.push(row);
    if (pendingIndentQty > 0) pendingIndents.push(row);
  }

  totals.omittedCount = totals.productCount - activeProductCount;

  needsAttention.sort((a, b) => {
    const severityDiff =
      NEEDS_ATTENTION_SEVERITY[a.status] - NEEDS_ATTENTION_SEVERITY[b.status];
    return severityDiff !== 0 ? severityDiff : a.currentStock - b.currentStock;
  });

  topMovers.sort((a, b) => b.soldQty - a.soldQty);
  pendingPurchaseOrders.sort((a, b) => b.pendingPoQty - a.pendingPoQty);
  pendingIndents.sort((a, b) => b.pendingIndentQty - a.pendingIndentQty);

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  return {
    monthLabel,
    totals,
    sections: {
      needsAttention,
      topMovers: topMovers.slice(0, TOP_MOVERS_LIMIT),
      pendingPurchaseOrders,
      pendingIndents,
    },
  };
}
