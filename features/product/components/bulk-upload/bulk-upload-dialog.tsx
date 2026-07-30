"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AxiosError } from "axios";
import { AlertCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { RowValidationResult } from "@/lib/bulk-upload/row-validation-error";

import { useBulkImportProducts } from "../../hooks/use-bulk-import-products";
import { ParsedProductRow } from "../../types/parsed-product-row";
import { ProductRowValidationError } from "../../service/bulk-upload/product-validation-error";

type RowError = RowValidationResult<
  ParsedProductRow,
  ProductRowValidationError
>;

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setRowErrors([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    onDrop,
  });

  const removeFile = () => {
    setFile(null);
    setRowErrors([]);
  };

  const { mutateAsync, isPending } = useBulkImportProducts();

  const handleImport = async () => {
    if (!file) return;

    try {
      const data = await mutateAsync(file);

      toast.success(data.message ?? "Products imported successfully");

      setFile(null);
      setRowErrors([]);
      setOpen(false);
    } catch (error) {
      const errors = (
        error as AxiosError<{ errors?: RowError[] }>
      ).response?.data?.errors;

      if (errors && errors.length > 0) {
        setRowErrors(errors);
      } else {
        toast.error(getApiErrorMessage(error));
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setFile(null);
          setRowErrors([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Upload</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Product Upload</DialogTitle>

          <DialogDescription>
            Upload a completed product template to create multiple products
            at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-xl border-2 border-dashed p-10 transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-4">
                <Upload className="size-7" />
              </div>

              <div>
                <p className="font-medium">
                  {isDragActive
                    ? "Drop your Excel file here"
                    : "Drag & drop your Excel file"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Only .xlsx files are supported.
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="size-8 text-green-600" />

                <div>
                  <p className="font-medium">{file.name}</p>

                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="size-4" />
              </Button>
            </div>
          )}

          {rowErrors.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 font-medium text-destructive">
                <AlertCircle className="size-4" />
                {rowErrors.length} row{rowErrors.length > 1 ? "s" : ""}{" "}
                failed validation
              </div>

              <ul className="space-y-1 text-sm text-destructive">
                {rowErrors.map((error, index) => (
                  <li key={`${error.rowNumber}-${error.field}-${index}`}>
                    Row {error.rowNumber}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button disabled={!file || isPending} onClick={handleImport}>
              {isPending ? "Importing..." : "Upload & Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
