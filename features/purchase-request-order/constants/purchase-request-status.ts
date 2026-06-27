export const PURCHASE_REQUEST_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  PARTIALLY_APPROVED: "PARTIALLY_APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PurchaseRequestStatus =
  (typeof PURCHASE_REQUEST_STATUS)[keyof typeof PURCHASE_REQUEST_STATUS];

export const PURCHASE_REQUEST_LABELS: Record<PurchaseRequestStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partially Approved",
  REJECTED: "Rejected",
};

export const PURCHASE_REQUEST_STATUS_COLORS: Record<
  PurchaseRequestStatus,
  "secondary" | "warning" | "success" | "info" | "destructive"
> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  PARTIALLY_APPROVED: "info",
  REJECTED: "destructive",
};
