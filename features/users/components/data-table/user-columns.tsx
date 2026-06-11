"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, UserRole } from "../../constants/user-role";

export const userColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) =>
      ROLE_LABELS[row.original.role as UserRole],
  },

  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.isActive
            ? "default"
            : "secondary"
        }
      >
        {row.original.isActive
          ? "Active"
          : "Inactive"}
      </Badge>
    ),
  },
];