export const PURCHASE_REQUEST_STATUS = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  PARTIALLY_APPROVED: "PARTIALLY_APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PurchaseRequestStatus =
  (typeof PURCHASE_REQUEST_STATUS)[keyof typeof PURCHASE_REQUEST_STATUS];

export const PURCHASE_REQUEST_STATUS_LABEL = {
  [PURCHASE_REQUEST_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [PURCHASE_REQUEST_STATUS.APPROVED]: "Approved",
  [PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED]: "Partially Approved",
  [PURCHASE_REQUEST_STATUS.REJECTED]: "Rejected",
} as const;

export const PURCHASE_REQUEST_STATUS_CONFIG: Record<
  PurchaseRequestStatus,
  { label: string; className: string }
> = {
  [PURCHASE_REQUEST_STATUS.PENDING_APPROVAL]: {
    label: PURCHASE_REQUEST_STATUS_LABEL.PENDING_APPROVAL,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [PURCHASE_REQUEST_STATUS.APPROVED]: {
    label: PURCHASE_REQUEST_STATUS_LABEL.APPROVED,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED]: {
    label: PURCHASE_REQUEST_STATUS_LABEL.PARTIALLY_APPROVED,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [PURCHASE_REQUEST_STATUS.REJECTED]: {
    label: PURCHASE_REQUEST_STATUS_LABEL.REJECTED,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};