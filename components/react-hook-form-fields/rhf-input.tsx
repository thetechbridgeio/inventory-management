import { FieldValues, Path, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RHFInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  value?: string;
  disabled?: boolean;
};

export function RHFInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  type = "text",
}: RHFInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
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
