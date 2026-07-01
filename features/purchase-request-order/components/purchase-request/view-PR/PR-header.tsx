import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Calendar,
  User,
  UserCheck,
  Package,
  Hash,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { PurchaseRequest } from "../../../types/purchase-request.type";
import { PURCHASE_REQUEST_STATUS_CONFIG } from "../../../constants/purchase-request-status";

function InfoItem({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export function PurchaseRequestHeader({ pr }: { pr: PurchaseRequest }) {
  const status = PURCHASE_REQUEST_STATUS_CONFIG[pr.status];

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Top row: PR number, status, timestamps */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {pr.purchaseRequestNumber}
          </h1>
          <Badge
            variant="outline"
            className={cn("font-medium", status.className)}
          >
            {status.label}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          Created {format(new Date(pr.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-4 sm:grid-cols-3 lg:grid-cols-5">
        <InfoItem
          icon={User}
          label="Requested By"
          value={pr.createdByUserName ?? "Unknown"}
        />

        <InfoItem
          icon={UserCheck}
          label="Processed By"
          value={pr.processedByUserName ?? "—"}
          subValue={
            pr.processedAt
              ? format(new Date(pr.processedAt), "MMM d, yyyy 'at' h:mm a")
              : undefined
          }
        />

        <InfoItem icon={Package} label="Total Items" value={pr.totalItems} />

        <InfoItem
          icon={Hash}
          label="Total Requested Qty"
          value={pr.totalRequestedQty}
        />

        <InfoItem
          icon={Calendar}
          label="Last Updated"
          value={format(new Date(pr.updatedAt), "MMM d, yyyy")}
        />
      </div>

      {/* Remarks — only if present, gets its own row */}
      {pr.remarks && (
        <>
          <Separator />
          <div className="flex items-start gap-2.5 px-6 py-3.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-1">
                Remarks
              </p>
              <p className="text-sm text-foreground">{pr.remarks}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
