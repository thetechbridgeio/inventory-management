"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Label } from "@/components/ui/label";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  label: string;
  value: string;
};

type RHFMultiSelectProps<
  T extends FieldValues,
> = {
  name: Path<T>;
  label: string;
  options: Option[];
  placeholder?: string;
  helperText?: string;
};

export function RHFMultiSelect<
  T extends FieldValues,
>({
  name,
  label,
  options,
  placeholder = "Select options",
  helperText,
}: RHFMultiSelectProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = name
    .split(".")
    .reduce<any>((obj, key) => obj?.[key], errors);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const values =
          (field.value as string[]) ?? [];

        const selectedOptions =
          options.filter((option) =>
            values.includes(option.value),
          );

        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label}
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  type="button"
                  variant="outline"
                  className={`
                    min-h-11
                    h-auto
                    w-full
                    justify-between
                    px-3
                    py-2
                    ${
                      error
                        ? "border-destructive"
                        : ""
                    }
                  `}
                >
                  <div className="flex flex-wrap gap-1 overflow-hidden">
                    {values.length === 0 ? (
                      <span className="text-muted-foreground">
                        {placeholder}
                      </span>
                    ) : (
                      <>
                        {selectedOptions
                          .slice(0, 2)
                          .map((option) => (
                            <Badge
                              key={
                                option.value
                              }
                              variant="secondary"
                              className="max-w-[140px]"
                            >
                              <span className="truncate">
                                {
                                  option.label
                                }
                              </span>
                            </Badge>
                          ))}

                        {values.length >
                          2 && (
                          <Badge variant="outline">
                            +
                            {values.length -
                              2}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder={`Search ${label.toLowerCase()}...`}
                  />

                  <CommandEmpty>
                    No results found.
                  </CommandEmpty>

                  {options.length ===
                  0 ? (
                    <div className="text-muted-foreground p-4 text-sm">
                      No options
                      available.
                    </div>
                  ) : (
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {options.map(
                        (option) => {
                          const selected =
                            values.includes(
                              option.value,
                            );

                          return (
                            <CommandItem
                              key={
                                option.value
                              }
                              onSelect={() => {
                                if (
                                  selected
                                ) {
                                  field.onChange(
                                    values.filter(
                                      (
                                        value,
                                      ) =>
                                        value !==
                                        option.value,
                                    ),
                                  );
                                } else {
                                  field.onChange(
                                    [
                                      ...values,
                                      option.value,
                                    ],
                                  );
                                }
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selected
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />

                              {
                                option.label
                              }
                            </CommandItem>
                          );
                        },
                      )}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {selectedOptions.length >
              0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedOptions.map(
                  (option) => (
                    <Badge
                      key={
                        option.value
                      }
                      variant="secondary"
                      className="gap-1"
                    >
                      {option.label}

                      <button
                        type="button"
                        className="hover:text-destructive ml-1"
                        onClick={() =>
                          field.onChange(
                            values.filter(
                              (
                                value,
                              ) =>
                                value !==
                                option.value,
                            ),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ),
                )}
              </div>
            )}

            {error?.message ? (
              <p className="text-destructive text-sm">
                {String(
                  error.message,
                )}
              </p>
            ) : (
              helperText && (
                <p className="text-muted-foreground text-sm">
                  {helperText}
                </p>
              )
            )}
          </div>
        );
      }}
    />
  );
}