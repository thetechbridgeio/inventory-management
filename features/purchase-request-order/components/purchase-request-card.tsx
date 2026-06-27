import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Layers,
  MoreVertical,
  Package,
  SplitSquareHorizontal,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { PurchaseRequestStatus } from "../constants/purchase-request-status";
import { PurchaseRequestListItem } from "../types/purchase-request.type";

type StatusConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  badgeClass: string;
};

const STATUS_CONFIG: Record<PurchaseRequestStatus, StatusConfig> = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    accent: "#94a3b8",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    icon: Clock,
    accent: "#f59e0b",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    accent: "#22c55e",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PARTIALLY_APPROVED: {
    label: "Partially Approved",
    icon: SplitSquareHorizontal,
    accent: "#3b82f6",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    accent: "#ef4444",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
  },
};

type PurchaseRequestCardProps = {
  request: PurchaseRequestListItem;
  onClick?: (request: PurchaseRequestListItem) => void;
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function PurchaseRequestCard({
  request,
  onClick,
}: PurchaseRequestCardProps) {
  const status = STATUS_CONFIG[request.status];
  const StatusIcon = status.icon;

  const isProcessed = !!request.processedAt && !!request.processedByUserName;

  return (
    <div
      className="group flex h-[88px] w-full items-center gap-5 overflow-hidden rounded-xl border border-slate-200 bg-white px-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      style={{ borderLeft: `4px solid ${status.accent}` }}
    >
      {/* Identity */}
      <div className="w-[180px] shrink-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Purchase Request
        </p>
        <h2 className="mt-0.5 truncate text-base font-semibold text-slate-900">
          {request.requestNumber}
        </h2>
        <div
          className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </div>
      </div>

      <div className="h-10 w-px shrink-0 bg-slate-100" />

      {/* Stats */}
      <div className="flex shrink-0 items-center gap-5">
        <Stat icon={Layers} label="Items" value={request.totalItems} />
        <Stat
          icon={Package}
          label="Quantity"
          value={request.totalRequestedQty}
        />
        <Stat
          icon={User}
          label="Created By"
          value={request.createdByUserName}
        />
      </div>

      <div className="h-10 w-px shrink-0 bg-slate-100" />

      {/* Dates */}
      <div className="flex shrink-0 items-center gap-5 text-xs">
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Created
          </p>
          <p className="mt-0.5 flex items-center gap-1 font-medium text-slate-700">
            <Calendar className="h-3 w-3 text-slate-400" />
            {formatDate(request.createdAt)}
          </p>
        </div>

        <div className="min-w-[110px] leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {request.status === "REJECTED" ? "Rejected By" : "Processed By"}
          </p>
          {isProcessed ? (
            <>
              <p className="mt-0.5 font-medium text-slate-700">
                {request.processedByUserName}
              </p>
              <p className="text-slate-400">
                {formatDate(request.processedAt!)}
              </p>
            </>
          ) : (
            <p className="mt-0.5 italic text-slate-400">Awaiting action</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onClick?.(request)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
