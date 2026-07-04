export const STOCK_STATUSES = {
  LOW: "LOW",
  SUFFICIENT: "SUFFICIENT",
  EXCESS: "EXCESS",
} as const;

export type StockStatus =
  (typeof STOCK_STATUSES)[keyof typeof STOCK_STATUSES];

export const STOCK_STATUS_LABELS: Record<
  StockStatus,
  string
> = {
  [STOCK_STATUSES.LOW]: "Low",
  [STOCK_STATUSES.SUFFICIENT]: "Sufficient",
  [STOCK_STATUSES.EXCESS]: "Excess",
};

export const STOCK_STATUS_OPTIONS: StockStatus[] = [
  STOCK_STATUSES.LOW,
  STOCK_STATUSES.SUFFICIENT,
  STOCK_STATUSES.EXCESS,
];

export const STOCK_STATUS_BADGES: Record<
  StockStatus,
  string
> = {
  [STOCK_STATUSES.LOW]:
    "bg-red-100 text-red-700 border border-red-200",

  [STOCK_STATUSES.SUFFICIENT]:
    "bg-green-100 text-green-700 border border-green-200",

  [STOCK_STATUSES.EXCESS]:
    "bg-amber-100 text-amber-700 border border-amber-200",
};