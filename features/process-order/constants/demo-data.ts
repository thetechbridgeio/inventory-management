import { ProcessOrderDetail } from "../types/process-order.types";
import { PROCESS_ORDER_ITEM_STATUS } from "./process-order-item-status";
import { PROCESS_ORDER_STATUS } from "./process-order-status";


export const demoProcessOrderDetail: ProcessOrderDetail = {
  id: "po-001",
  processOrderNo: "PRO-2026-0001",
  status: PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED,
  vendorName: "ABC Engineering Works",
  remarks: "Anodizing and finishing of aluminum parts.",
  createdAt: new Date("2026-07-10T09:30:00"),

  items: [
    {
      id: "item-001",
      processOrderId: "po-001",

      sentProduct: {
        id: "prod-raw-001",
        name: "Aluminum Plate",
        description: "Raw aluminum sheet 5mm",
        category: "RAW",
        unit: "PCS",
      },

      receivedProduct: {
        id: "prod-fin-001",
        name: "Anodized Aluminum Plate",
        description: "Black anodized aluminum plate",
        category: "FINISHED",
        unit: "PCS",
      },

      sentQty: 100,
      receivedQty: 80,
      sentDate: new Date("2026-07-10"),
      receivedDate: new Date("2026-07-12"),
      processingCost: 2500,
      location: "Vendor Warehouse",
      status: PROCESS_ORDER_ITEM_STATUS.RECEIVED,
    },

    {
      id: "item-002",
      processOrderId: "po-001",

      sentProduct: {
        id: "prod-raw-002",
        name: "Steel Bracket",
        description: "Mild steel bracket",
        category: "RAW",
        unit: "PCS",
      },

      receivedProduct: {
        id: "prod-fin-002",
        name: "Powder Coated Steel Bracket",
        description: "Black powder coated bracket",
        category: "FINISHED",
        unit: "PCS",
      },

      sentQty: 50,
      receivedQty: null,
      sentDate: new Date("2026-07-11"),
      receivedDate: null,
      processingCost: 1200,
      location: "Factory Unit 2",
      status: PROCESS_ORDER_ITEM_STATUS.SENT,
    },

    {
      id: "item-003",
      processOrderId: "po-001",

      sentProduct: {
        id: "prod-raw-003",
        name: "Copper Busbar",
        description: null,
        category: "RAW",
        unit: "PCS",
      },

      receivedProduct: {
        id: "prod-fin-003",
        name: "Tin Coated Busbar",
        description: "Electro tin coated",
        category: "FINISHED",
        unit: "PCS",
      },

      sentQty: 30,
      receivedQty: 30,
      sentDate: new Date("2026-07-09"),
      receivedDate: new Date("2026-07-11"),
      processingCost: 1800,
      location: "Vendor Plant",
      status: PROCESS_ORDER_ITEM_STATUS.RECEIVED,
    },
  ],
};