"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Package, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useProducts } from "../hooks/use-products";
import { Product } from "../types/product.types";
import { Label } from "@/components/ui/label";

type ProductPickerProps = {
  value?: string;
  selectedProductIds?: string[];
  onChange: (product: Product) => void;
  onClear?: () => void;
};

export function ProductPicker({
  value,
  selectedProductIds = [],
  onChange,
  onClear,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useProducts({
    search: debouncedSearch,
  });

  const products = useMemo(() => {
    return (data?.items ?? []).filter((product: Product) => {
      if (product.id === value) {
        return true;
      }

      return !selectedProductIds.includes(product.id);
    });
  }, [data?.items, selectedProductIds, value]);

  const selectedProduct = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return (
      products.find((product: Product) => product.id === value) ??
      data?.items?.find((product: Product) => product.id === value)
    );
  }, [value, products, data?.items]);

  if (selectedProduct) {
    return (
      <div className="rounded-xl border bg-card px-4 py-2 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 gap-1">
            {/* <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-5 text-primary" />
            </div> */}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{selectedProduct.name}</p>

              <div className=" flex flex-wrap gap-2">
                <span className="text-muted-foreground text-sm">
                  Stock: {selectedProduct.currentStock}
                </span>

                <span className="text-muted-foreground text-sm">
                  Unit: {selectedProduct.unit}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
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
    <div className="space-y-3">
        <Label>Product</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product by name..."
          className="pl-9"
        />
      </div>

      {debouncedSearch && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Searching products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {products.map((product: Product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onChange(product);

                    setSearch("");

                    setDebouncedSearch("");
                  }}
                  className="flex w-full items-start gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs truncate">{product.description}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Stock: {product.currentStock}
                      </span>

                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Unit: {product.unit}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
