"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageItem = File | string;

interface MultiImageUploadProps {
  value?: ImageItem[];
  onChange: (images: ImageItem[]) => void;

  label?: string;
  description?: string;

  accept?: string;
  maxSizeMB?: number;
  maxImages?: number;

  disabled?: boolean;
  className?: string;
}

export function MultiImageUpload({
  value,
  onChange,
  label,
  description,
  accept = "image/*",
  maxSizeMB = 5,
  maxImages = 5,
  disabled = false,
  className,
}: MultiImageUploadProps) {
  const images = value ?? [];
  const remainingSlots = maxImages - images.length;

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) return;

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`"${file.name}" exceeds the maximum size of ${maxSizeMB} MB`);

        continue;
      }

      validFiles.push(file);
    }

    const accepted = validFiles.slice(0, remainingSlots);

    if (validFiles.length > accepted.length) {
      alert(`You can upload up to ${maxImages} images per product.`);
    }

    if (accepted.length > 0) {
      onChange([...images, ...accepted]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
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

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {images.map((image, index) => (
          <ImageThumbnail
            key={index}
            image={image}
            disabled={disabled}
            onRemove={() => handleRemove(index)}
          />
        ))}

        {remainingSlots > 0 && !disabled && (
          <div className="border-border hover:border-primary/50 relative aspect-square rounded-xl border-2 border-dashed transition-colors">
            <input
              type="file"
              accept={accept}
              multiple
              disabled={disabled}
              className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              onChange={handleFilesChange}
            />

            <div className="flex h-full flex-col items-center justify-center p-2 text-center">
              <ImagePlus className="text-muted-foreground mb-1 h-6 w-6" />

              <p className="text-muted-foreground text-xs">Add image</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        {images.length}/{maxImages} images &middot; JPG, PNG, WEBP up to{" "}
        {maxSizeMB} MB each
      </p>
    </div>
  );
}

function ImageThumbnail({
  image,
  disabled,
  onRemove,
}: {
  image: ImageItem;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (typeof image === "string") {
      setPreview(image);

      return;
    }

    const url = URL.createObjectURL(image);

    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border">
      {preview && (
        <img
          src={preview}
          alt="Product"
          className="h-full w-full object-cover"
        />
      )}

      {!disabled && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
