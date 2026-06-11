"use client";

import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Loader2, Plus, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { useProduct } from "../hooks/use-product";
import { useAddSupplierToProduct } from "../hooks/use-add-supplier-product";

const schema = z.object({
  supplierId: z.string().uuid(),
});

type FormValues = z.infer<typeof schema>;

type AddSupplierToProductDialogProps = {
  productId: string;
  children?: React.ReactNode;
};

export function AddSupplierToProductDialog({
  productId,
  children,
}: AddSupplierToProductDialogProps) {
  const { data: product } = useProduct(productId);

  const { data: suppliersResponse, isLoading: suppliersLoading } =
    useSuppliers();

  const { mutateAsync, isPending } = useAddSupplierToProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
    },
  });

  const availableSuppliers = useMemo(() => {
    if (!suppliersResponse?.data || !product) {
      return [];
    }

    const linkedSupplierIds = new Set(
      product.suppliers.map((supplier: any) => supplier.id),
    );

    return suppliersResponse.data
      .filter((supplier: any) => !linkedSupplierIds.has(supplier.id))
      .map((supplier: any) => ({
        label: supplier.companyName,
        value: supplier.id,
      }));
  }, [suppliersResponse, product]);

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        productId,
        supplierId: values.supplierId,
      });

      toast.success("Supplier added successfully");

      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add supplier",
      );
    }
  }

  const isLoading = suppliersLoading || !product;

  const noSuppliersAvailable = !isLoading && availableSuppliers.length === 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>

          <DialogDescription>
            Link an existing supplier to this product.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : noSuppliersAvailable ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Truck className="h-10 w-10 text-muted-foreground/50" />

            <div>
              <p className="font-medium">No suppliers available</p>

              <p className="text-sm text-muted-foreground">
                All suppliers are already linked to this product.
              </p>
            </div>
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <RHFSelect<FormValues>
                name="supplierId"
                label="Supplier"
                placeholder="Select supplier"
                helperText="Only suppliers not already linked to this product are shown."
                options={availableSuppliers}
              />

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Supplier
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
