"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
}: MultiSelectProps) {
  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-auto min-h-10 w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              <>
                {selectedOptions
                  .slice(0, 2)
                  .map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                    >
                      {option.label}
                    </Badge>
                  ))}

                {selectedOptions.length > 2 && (
                  <Badge variant="outline">
                    +{selectedOptions.length - 2}
                  </Badge>
                )}
              </>
            )}
          </div>

          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search..." />

          <CommandEmpty>
            No results found.
          </CommandEmpty>

          <CommandGroup className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const selected = value.includes(
                option.value,
              );

              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (selected) {
                      onChange(
                        value.filter(
                          (v) => v !== option.value,
                        ),
                      );
                    } else {
                      onChange([
                        ...value,
                        option.value,
                      ]);
                    }
                  }}
                >
                  <Check
                    className={
                      selected
                        ? "mr-2 h-4 w-4 opacity-100"
                        : "mr-2 h-4 w-4 opacity-0"
                    }
                  />

                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}