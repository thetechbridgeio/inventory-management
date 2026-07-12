export const PROCESS_ORDER_STATUS = {
  SENT: "SENT",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export type ProcessOrderStatus =
  (typeof PROCESS_ORDER_STATUS)[keyof typeof PROCESS_ORDER_STATUS];

export const PROCESS_ORDER_STATUS_VALUES = Object.values(
  PROCESS_ORDER_STATUS
) as [ProcessOrderStatus, ...ProcessOrderStatus[]];

export const PROCESS_ORDER_STATUS_LABELS: Record<
  ProcessOrderStatus,
  string
> = {
  [PROCESS_ORDER_STATUS.SENT]: "Sent",
  [PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED]: "Partially Received",
  [PROCESS_ORDER_STATUS.RECEIVED]: "Received",
  [PROCESS_ORDER_STATUS.CANCELLED]: "Cancelled",
};