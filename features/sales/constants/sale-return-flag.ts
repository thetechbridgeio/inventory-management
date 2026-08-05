export const SALE_RETURN_FLAG = {
  PENDING: "PENDING",
  PARTIALLY_RETURNED: "PARTIALLY_RETURNED",
  FULLY_RETURNED: "FULLY_RETURNED",
} as const;

export type SaleReturnFlag =
  (typeof SALE_RETURN_FLAG)[keyof typeof SALE_RETURN_FLAG];

export const SALE_RETURN_FLAG_CONFIG: Record<
  SaleReturnFlag,
  { label: string; className: string }
> = {
  [SALE_RETURN_FLAG.PENDING]: {
    label: "Return Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [SALE_RETURN_FLAG.PARTIALLY_RETURNED]: {
    label: "Partially Returned",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [SALE_RETURN_FLAG.FULLY_RETURNED]: {
    label: "Fully Returned",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};
