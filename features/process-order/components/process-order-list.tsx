"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { ProcessOrderCard } from "./process-order.card";
import { useProcessOrders } from "../hooks/use-process-orders";

const ProcessOrderList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: response, isLoading } = useProcessOrders({
    page,
    search: debouncedSearch || undefined,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  });

  const orders = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = response?.totalPages ?? 1;
  const currentPage = response?.page ?? page;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <div>
            <label className="mb-1 block text-sm font-medium">Search</label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search vendor..."
                value={search}
                className="pl-9"
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">From</label>

            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPage(1);
                setFromDate(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">To</label>

            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPage(1);
                setToDate(e.target.value);
              }}
            />
          </div>

          <Button
            variant="outline"
            className="self-end"
            onClick={() => {
              setPage(1);
              setSearch("");
              setFromDate("");
              setToDate("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 h-[60vh] overflow-auto">
        {isLoading ? (
          <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
            Loading process orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
            No process orders found.
          </div>
        ) : (
          orders.map((order) => (
            <ProcessOrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">{total} total records</p>

          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="min-w-24 text-center text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessOrderList;
