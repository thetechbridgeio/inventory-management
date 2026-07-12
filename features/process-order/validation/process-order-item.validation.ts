import { z } from "zod";
import { PROCESS_ORDER_ITEM_STATUS } from "../constants/process-order-item-status";
import { ProcessOrderCreateFormSchema } from "./process-order.validation";

export const ProcessOrderItemBaseSchema = z.object({
  id: z.uuid(),
  processOrderId: z.uuid(),
  sentProductId: z.uuid("Please select a product"),
  receivedProductId: z.uuid("Please select a product"),
  sentQty: z.number().positive(),
  receivedQty: z.number().min(0),
  sentDate: z.date(),
  receivedDate: z.date().nullable().optional(),
  processingCost: z.number().min(0).nullable().optional(),
  location: z.string().trim().nullable().optional(),
});

export const ProcessOrderItemCreateFormSchema = ProcessOrderItemBaseSchema.pick(
  {
    sentProductId: true,
    receivedProductId: true,
    sentQty: true,
    sentDate: true,
    processingCost: true,
    location: true,
  },
);

export const ProcessOrderItemCreateSchema =
  ProcessOrderItemCreateFormSchema.extend({
    status: z.literal(PROCESS_ORDER_ITEM_STATUS.SENT),
    processOrderId: ProcessOrderItemBaseSchema.shape.processOrderId,
  });

export const ProcessOrderCreatePayloadSchema = z.object({
  processOrder: ProcessOrderCreateFormSchema,
  items: z.array(ProcessOrderItemCreateFormSchema).min(1),
});

export const ProcessOrderItemUpdateFormSchema = ProcessOrderItemBaseSchema.pick(
  {
    id: true,
    receivedDate: true,
    receivedQty: true,
    processingCost: true,
    location: true,
  },
).extend({
    status: z.enum([
      PROCESS_ORDER_ITEM_STATUS.RECEIVED,
      PROCESS_ORDER_ITEM_STATUS.CANCELLED,
    ]),
});

export const ProcessOrderUpdatePayloadSchema = z.object({
  items: z.array(ProcessOrderItemUpdateFormSchema)
});

