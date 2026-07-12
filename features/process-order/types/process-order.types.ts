import { z } from "zod";
import {
  ProcessOrderItemCreateFormSchema,
  ProcessOrderItemCreateSchema,
  ProcessOrderItemUpdateFormSchema,
  ProcessOrderCreatePayloadSchema,
  ProcessOrderUpdatePayloadSchema,
} from "../validation/process-order-item.validation";
import {
  ProcessOrderCreateFormSchema,
  ProcessOrderCreateSchema,
  ProcessOrderUpdateSchema,
} from "../validation/process-order.validation";
import { processOrders } from "../schemas/process-orders.schema";
import { processOrderItems } from "../schemas/process-order-item.schema";
import { ProcessOrderStatus } from "../constants/process-order-status";
import { ProcessOrderItemStatus } from "../constants/process-order-item-status";

// Process Order
export type ProcessOrderCreateForm = z.infer<
  typeof ProcessOrderCreateFormSchema
>;
export type ProcessOrderCreate = z.infer<typeof ProcessOrderCreateSchema>;
export type ProcessOrderUpdate = z.infer<typeof ProcessOrderUpdateSchema>;

// Process Order Item
export type ProcessOrderItemCreateForm = z.infer<
  typeof ProcessOrderItemCreateFormSchema
>;
export type ProcessOrderItemCreate = z.infer<
  typeof ProcessOrderItemCreateSchema
>;
export type ProcessOrderItemUpdateForm = z.infer<
  typeof ProcessOrderItemUpdateFormSchema
>;

// Payloads
export type ProcessOrderCreatePayload = z.infer<
  typeof ProcessOrderCreatePayloadSchema
>;

export type ProcessOrderUpdatePayload = z.infer<
  typeof ProcessOrderUpdatePayloadSchema
>;

export type ProcessOrder = typeof processOrders.$inferSelect;
export type ProcessOrderItem = typeof processOrderItems.$inferSelect;

export type GetProcessOrdersFilters = {
  page: number;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type GetProcessOrdersParams = {
  page: number;
  pageSize: number;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type ProcessOrderList = {
  id: string;
  processOrderNo: string;
  status: ProcessOrderStatus;
  vendorName: string | null;
  remarks: string | null;
  itemCount: number;
  totalSentQty: number;
  totalReceivedQty: number;
  totalProcessingCost: number;
  lastSentDate: Date | null;
  lastReceivedDate: Date | null;
  createdAt: Date;
};

export type ProcessOrderDetailItemProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
};

export type ProcessOrderDetailItem = {
  id: string;
  processOrderId: string;
  sentProduct: ProcessOrderDetailItemProduct;
  receivedProduct: ProcessOrderDetailItemProduct;
  sentQty: number;
  receivedQty: number | null;
  sentDate: Date;
  receivedDate: Date | null;
  processingCost: number | null;
  location: string | null;
  status: ProcessOrderItemStatus;
};

export type ProcessOrderDetail = {
  id: string;
  processOrderNo: string;
  status: ProcessOrderStatus;
  vendorName: string | null;
  remarks: string | null;
  createdAt: Date;
  items: ProcessOrderDetailItem[];
};
