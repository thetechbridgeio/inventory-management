"use client";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import { ProcessOrderDetail } from "../../types/process-order.types";
import { PROCESS_ORDER_STATUS } from "../../constants/process-order-status";
import { formatDate } from "@/lib/format-date";

interface ProcessOrderHeaderProps {
  order: ProcessOrderDetail;
}

const statusConfig = {
  [PROCESS_ORDER_STATUS.SENT]: {
    icon: Clock,
    label: "Sent",
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-600",
  },
  [PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED]: {
    icon: AlertCircle,
    label: "Partially Received",
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600",
  },
  [PROCESS_ORDER_STATUS.RECEIVED]: {
    icon: CheckCircle,
    label: "Received",
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-600",
  },
  [PROCESS_ORDER_STATUS.CANCELLED]: {
    icon: XCircle,
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-600",
  },
} as const;

export function ProcessOrderHeader({ order }: ProcessOrderHeaderProps) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Process #{order.processOrderNo}
          </h1>
          <p className="text-sm text-gray-500">
            Created on{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full text-sm px-4 py-2 ${config.color}`}
        >
          <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
          <span className="font-semibold">{config.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Vendor</p>
          <p className="text-gray-900">{order.vendorName || "—"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            Total Items
          </p>
          <p className="text-gray-900">{order.items.length}</p>
        </div>
        {order.remarks && (
          <div className="md:col-span-1">
            <p className="text-sm font-semibold text-gray-600 mb-1">Remarks</p>
            <p className="text-gray-900 text-sm">{order.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
