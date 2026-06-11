"use client";

import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";

import { useUsers } from "../../hooks/use-users";

import { UserTable } from "./user-table";
import { userColumns } from "./user-columns";
import { UserTableTools } from "./user-table-tools";
import { UserRole } from "../../../auth/constants/user-role";

export function UserList() {
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    role: parseAsString,
    isActive: parseAsBoolean,
  });

  const { data, isLoading } = useUsers({
    page: filters.page,
    search: filters.search || undefined,
    role: filters.role ? (filters.role as UserRole) : undefined,
    isActive: filters.isActive ?? undefined,
  });

  console.log(data)

  return (
    <div className="space-y-6">
      <UserTableTools
        filters={{
          search: filters.search,
          role: filters.role,
          isActive: filters.isActive,
        }}
        setFilters={setFilters}
      />

      <UserTable
        columns={userColumns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(page) =>
          setFilters({
            page,
          })
        }
      />
    </div>
  );
}
