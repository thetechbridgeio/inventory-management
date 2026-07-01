export const PURCHASE_ORDER_STATUS = {
  EMAIL_PENDING: "EMAIL_PENDING",
  EMAIL_SENT: "EMAIL_SENT",
} as const;

export type PurchaseOrderStatus =
  (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS];

export const PURCHASE_ORDER_STATUS_LABEL = {
  [PURCHASE_ORDER_STATUS.EMAIL_PENDING]: "Email Pending",
  [PURCHASE_ORDER_STATUS.EMAIL_SENT]: "Email Sent",
} as const;