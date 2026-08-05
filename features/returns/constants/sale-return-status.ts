export const SALE_RETURN_STATUS = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type SaleReturnStatus =
  (typeof SALE_RETURN_STATUS)[keyof typeof SALE_RETURN_STATUS];

export const SALE_RETURN_STATUS_LABEL: Record<SaleReturnStatus, string> = {
  [SALE_RETURN_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [SALE_RETURN_STATUS.APPROVED]: "Approved",
  [SALE_RETURN_STATUS.REJECTED]: "Rejected",
};

export const SALE_RETURN_STATUS_CONFIG: Record<
  SaleReturnStatus,
  { label: string; className: string }
> = {
  [SALE_RETURN_STATUS.PENDING_APPROVAL]: {
    label: SALE_RETURN_STATUS_LABEL.PENDING_APPROVAL,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [SALE_RETURN_STATUS.APPROVED]: {
    label: SALE_RETURN_STATUS_LABEL.APPROVED,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [SALE_RETURN_STATUS.REJECTED]: {
    label: SALE_RETURN_STATUS_LABEL.REJECTED,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};
