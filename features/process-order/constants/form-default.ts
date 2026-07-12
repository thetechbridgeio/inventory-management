import {
  ProcessOrderCreatePayload,
  ProcessOrderItemCreateForm,
} from "../types/process-order.types";

export const PROCESS_ORDER_ITEM_DEFAULT: ProcessOrderItemCreateForm = {
  sentProductId: "",
  receivedProductId: "",
  sentQty: 1,
  sentDate: new Date(),
  processingCost: undefined,
  location: "",
} satisfies ProcessOrderCreatePayload["items"][number];

export const PROCESS_ORDER_DEFAULT_VALUES: ProcessOrderCreatePayload = {
  processOrder: {
    vendorName: "",
    remarks: "",
  },
  items: [{ ...PROCESS_ORDER_ITEM_DEFAULT }],
};
