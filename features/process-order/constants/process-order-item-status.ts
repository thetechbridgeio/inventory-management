export const PROCESS_ORDER_ITEM_STATUS = {
  SENT: "SENT",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export type ProcessOrderItemStatus =
  (typeof PROCESS_ORDER_ITEM_STATUS)[keyof typeof PROCESS_ORDER_ITEM_STATUS];

export const PROCESS_ORDER_ITEM_STATUS_VALUES = Object.values(
  PROCESS_ORDER_ITEM_STATUS
) as [ProcessOrderItemStatus, ...ProcessOrderItemStatus[]];

export const PROCESS_ORDER_ITEM_STATUS_LABELS: Record<
  ProcessOrderItemStatus,
  string
> = {
  [PROCESS_ORDER_ITEM_STATUS.SENT]: "Sent",
  [PROCESS_ORDER_ITEM_STATUS.RECEIVED]: "Received",
  [PROCESS_ORDER_ITEM_STATUS.CANCELLED]: "Cancelled",
};