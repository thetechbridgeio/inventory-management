import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type RHFSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  helperText?: string;
  checkedValue?: unknown;
  uncheckedValue?: unknown;
};

export function RHFSwitch<T extends FieldValues>({
  name,
  label,
  helperText,
  checkedValue,
  uncheckedValue,
}: RHFSwitchProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

  return (
    <div className="space-y-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg p-4 gap-2">
            <div>
              <Label>{label}</Label>

              {helperText && (
                <p className="text-sm text-muted-foreground">{helperText}</p>
              )}
            </div>

            <Switch
              checked={
                checkedValue !== undefined
                  ? field.value === checkedValue
                  : Boolean(field.value)
              }
              onCheckedChange={(checked) => {
                if (checkedValue !== undefined) {
                  field.onChange(checked ? checkedValue : uncheckedValue);
                } else {
                  field.onChange(checked);
                }
              }}
            />
          </div>
        )}
      />

      {error?.message && (
        <p className="text-sm text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
}
