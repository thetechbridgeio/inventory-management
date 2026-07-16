import { FieldValues, Path, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RHFInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  required?: boolean;
};

export function RHFInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  type = "text",
  required = false,
}: RHFInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

 const registerOptions =
  type === "number"
    ? {
        setValueAs: (value: unknown) =>
          value === "" || value == null ? undefined : Number(value),
      }
    : {
        setValueAs: (value: unknown) => {
          if (value == null) return undefined;

          const str = String(value).trim();
          return str === "" ? undefined : str;
        },
      };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        {...register(name, registerOptions)}
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
