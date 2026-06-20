"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file?: File) => void;

  label?: string;
  description?: string;

  accept?: string;
  maxSizeMB?: number;

  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  description,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!value) {
      setPreview(undefined);

      return;
    }

    if (typeof value === "string") {
      setPreview(value);

      return;
    }

    const url = URL.createObjectURL(value);

    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Maximum file size is ${maxSizeMB} MB`);

      return;
    }

    onChange(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {(label || description) && (
        <div>
          {label && <label className="text-sm font-medium">{label}</label>}

          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      )}

      {!preview ? (
        <div className="border-border hover:border-primary/50 relative rounded-xl border-2 border-dashed transition-colors">
          <input
            type="file"
            accept={accept}
            disabled={disabled}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center justify-center p-6 text-center">
            <ImagePlus className="text-muted-foreground mb-3 h-10 w-10" />

            <p className="font-medium">Click to upload</p>

            <p className="text-muted-foreground text-sm">
              JPG, PNG, WEBP up to {maxSizeMB} MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border">
          <img
            src={preview}
            alt="Preview"
            className="h-64 w-full object-contain"
          />

          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
