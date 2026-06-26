"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { Supplier } from "@/features/suppliers/types/suppliers.type";

type SupplierPickerProps = {
  value?: string;
  selectedSupplierIds?: string[];
  onChange: (supplier: Supplier) => void;
  onClear?: () => void;
  popover?: boolean;
};

export function SupplierPicker({
  value,
  selectedSupplierIds = [],
  onChange,
  onClear,
  popover = false,
}: SupplierPickerProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useSuppliers({
    search: debouncedSearch,
    page: 1,
  });

  const suppliers: Supplier[] = useMemo(() => {
    return (data?.data ?? []).filter((supplier: Supplier) => {
      if (supplier.id === value) {
        return true;
      }

      return !selectedSupplierIds.includes(supplier.id);
    });
  }, [data?.data, selectedSupplierIds, value]);

  const selectedSupplier = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return (
      suppliers.find((supplier) => supplier.id === value) ??
      data?.data?.find((supplier: Supplier) => supplier.id === value)
    );
  }, [value, suppliers, data?.data]);

  if (selectedSupplier) {
    return (
      <div className="rounded-xl border bg-card px-4 py-2 shadow-sm h-fit">
        <div className="flex items-center justify-between h-fit">
          <div className="flex items-center gap-3">
            <p>{selectedSupplier.companyName}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              onClear?.();
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${popover && "p-3"}`}>
      <Label>Supplier</Label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search supplier..."
          className="pl-9"
        />
      </div>

      {debouncedSearch && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Searching suppliers...
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No suppliers found
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {suppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => {
                    onChange(supplier);
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                  className="flex w-full items-center gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <span>{supplier.companyName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
