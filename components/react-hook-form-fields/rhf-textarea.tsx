import { FieldValues, Path, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RHFTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
};

export function RHFTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
}: RHFTextareaProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Textarea
        id={name}
        placeholder={placeholder}
        {...register(name, {
          setValueAs: (value: string) =>
            value.trim() === "" ? undefined : value,
        })}
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
