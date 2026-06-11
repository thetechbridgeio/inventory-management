"use client";

import {
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";


import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES } from "../../constants/user-role";

type Props = {
  filters: {
    search: string;
    role: string | null;
    isActive: boolean | null;
  };

  setFilters: (
    values: Partial<{
      page: number;
      search: string;
      role: string | null;
      isActive: boolean | null;
    }>,
  ) => void;
};

export function UserTableTools({
  filters,
  setFilters,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Search users..."
          className="pl-9"
          value={filters.search}
          onChange={(e) =>
            setFilters({
              search: e.target.value,
              page: 1,
            })
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 size-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 p-4"
          >
            <DropdownMenuLabel>
              Filters
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="space-y-3">
              <Select
                value={
                  filters.role ?? "all"
                }
                onValueChange={(value) =>
                  setFilters({
                    role:
                      value === "all"
                        ? null
                        : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Roles
                  </SelectItem>

                  <SelectItem
                    value={ROLES.SUPER_ADMIN}
                  >
                    Super Admin
                  </SelectItem>

                  <SelectItem
                    value={
                      ROLES.PURCHASE_ADMIN
                    }
                  >
                    Purchase Admin
                  </SelectItem>

                  <SelectItem
                    value={ROLES.STORE_ADMIN}
                  >
                    Store Admin
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filters.isActive === null
                    ? "all"
                    : String(
                        filters.isActive,
                      )
                }
                onValueChange={(value) =>
                  setFilters({
                    isActive:
                      value === "all"
                        ? null
                        : value ===
                          "true",
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Statuses
                  </SelectItem>

                  <SelectItem value="true">
                    Active
                  </SelectItem>

                  <SelectItem value="false">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={() =>
            setFilters({
              page: 1,
              search: "",
              role: null,
              isActive: null,
            })
          }
        >
          <RotateCcw className="mr-2 size-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}