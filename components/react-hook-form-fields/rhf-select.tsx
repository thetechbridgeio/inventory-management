import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type RHFSelectProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  options: Option[];
};

export function RHFSelect<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
  options,
}: RHFSelectProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {error?.message ? (
        <p className="text-sm text-destructive">{String(error.message)}</p>
      ) : (
        helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )
      )}
    </div>
  );
}
