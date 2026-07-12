"use client";

import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type RHFDatePickerProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
};

export function RHFDatePicker<T extends FieldValues>({
  name,
  label,
  placeholder = "Select date",
}: RHFDatePickerProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={name}
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />

                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                // initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />

      {error && (
        <p className="text-sm text-destructive">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}