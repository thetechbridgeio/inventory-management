"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  filters: {
    search: string;
    isActive: boolean | null;
  };

  setFilters: (
    values: Partial<{
      search: string;
      isActive: boolean | null;
    }>,
  ) => void;
};

export function SupplierTableTools({
  filters,
  setFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

        <Input
          value={filters.search}
          placeholder="Search suppliers..."
          className="pl-9"
          onChange={(e) =>
            setFilters({
              search: e.target.value,
            })
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={
            filters.isActive === null
              ? "all"
              : String(filters.isActive)
          }
          onValueChange={(value) =>
            setFilters({
              isActive:
                value === "all"
                  ? null
                  : value === "true",
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Suppliers
            </SelectItem>
            <SelectItem value="true">
              Active
            </SelectItem>
            <SelectItem value="false">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setFilters({
              search: "",
              isActive: null,
            })
          }
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}