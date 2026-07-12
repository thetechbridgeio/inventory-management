"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";
import {
  ProcessOrderDetail,
  ProcessOrderUpdatePayload,
} from "../../types/process-order.types";
import { formatDate } from "@/lib/format-date";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { PROCESS_ORDER_ITEM_STATUS } from "../../constants/process-order-item-status";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFDatePicker } from "@/components/react-hook-form-fields/rhf-datepicker";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RHFSwitch } from "@/components/react-hook-form-fields/rhf-switch";
import { PROCESS_ORDER_STATUS } from "../../constants/process-order-status";
import { Badge } from "@/components/ui/badge";

interface ProcessOrderItemsProps {
  items: ProcessOrderDetail["items"];
  status: ProcessOrderDetail["status"];
  isProcessOrderUpdatePending: boolean;
}

export function ProcessOrderItems({
  items,
  status,
  isProcessOrderUpdatePending,
}: ProcessOrderItemsProps) {
  const isEditable = status === PROCESS_ORDER_STATUS.SENT;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { control } = useFormContext<ProcessOrderUpdatePayload>();

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
  });

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">Processing Items</h2>
      </div>

      <div className="divide-y divide-border">
        {fields.map((field, index) => {
          const item = items[index];
          const values = watchedItems?.[index];

          return (
            <div key={field.id} className="transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-center gap-4">
                <div
                  role="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr_auto]">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Sent Product
                        </p>

                        <p className="text-sm font-semibold">
                          {item.sentProduct.name}
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {item.sentProduct.category}
                          </span>
                        </p>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                          <span>
                            <span className="font-medium text-foreground">
                              {item.sentQty}
                            </span>{" "}
                            {item.sentProduct.unit}
                          </span>
                          <span>{formatDate(item.sentDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Received Product
                      </p>

                      <p className="text-sm font-semibold">
                        {item.receivedProduct.name}
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {item.receivedProduct.category}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          <span className="font-medium text-foreground">
                            {values?.receivedQty ?? "—"}
                          </span>{" "}
                          {item.receivedProduct.unit}
                        </span>

                        <span>
                          {values?.receivedDate
                            ? formatDate(values.receivedDate)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mr-4">
                     {isEditable ? (
                  <div>
                    <RHFSwitch
                      name={`items.${index}.status`}
                      label="Received"
                      checkedValue={PROCESS_ORDER_ITEM_STATUS.RECEIVED}
                      uncheckedValue={PROCESS_ORDER_ITEM_STATUS.CANCELLED}
                    />
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className={
                      item.status === PROCESS_ORDER_ITEM_STATUS.RECEIVED
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }
                  >
                    {item.status === PROCESS_ORDER_ITEM_STATUS.RECEIVED
                      ? "Received"
                      : "Cancelled"}
                  </Badge>
                )}
                    </div>
               
              </div>

              {expandedItems.has(item.id) && (
                <div className="border-t border-border bg-muted/30 px-6 py-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        Sent Details
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Product
                          </p>
                          <div className="mt-1 text-sm">
                            {item.sentProduct.name}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Quantity
                          </p>
                          <div className="mt-1 text-sm font-semibold">
                            {item.sentQty} {item.sentProduct.unit}
                          </div>
                        </div>

                        <div>
                          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Date Sent
                          </p>
                          <div className="mt-1 text-sm">
                            {formatDate(item.sentDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 flex items-center gap-2 font-semibold">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        Processing Details
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Received Product
                          </p>
                          <div className="mt-1 text-sm">
                            {item.receivedProduct.name}
                          </div>
                        </div>

                        {isEditable ? (
                          <>
                            <RHFInput<ProcessOrderUpdatePayload>
                              name={`items.${index}.receivedQty`}
                              label="Received Quantity"
                              type="number"
                            />

                            <RHFDatePicker<ProcessOrderUpdatePayload>
                              name={`items.${index}.receivedDate`}
                              label="Received Date"
                            />

                            <RHFInput<ProcessOrderUpdatePayload>
                              name={`items.${index}.processingCost`}
                              label="Processing Cost"
                              type="number"
                            />

                            <RHFInput<ProcessOrderUpdatePayload>
                              name={`items.${index}.location`}
                              label="Location"
                            />
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                Received Quantity
                              </p>
                              <div className="mt-1 text-sm">
                                {values?.receivedQty ?? "—"}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                Received Date
                              </p>
                              <div className="mt-1 text-sm">
                                {values?.receivedDate
                                  ? formatDate(values.receivedDate)
                                  : "—"}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                Processing Cost
                              </p>
                              <div className="mt-1 text-sm">
                                {values?.processingCost ?? "—"}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                Location
                              </p>
                              <div className="mt-1 text-sm">
                                {values?.location || "—"}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {/* Footer */}
        {isEditable && (
          <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-4">
            <Button type="submit" disabled={isProcessOrderUpdatePending}>
              {isProcessOrderUpdatePending ? "Updating.." : "Submit"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
