"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2 } from "lucide-react";

import { ROLE_LABELS, UserRole } from "../../../auth/constants/user-role";
import { ChangeRoleDialog } from "../change-role-dialog";
import { DeleteUserDialog } from "../delete-user-dialog";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export const userColumns: ColumnDef<UserRow>[] = [
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
      ROLE_LABELS[row.original.role],
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

  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <ChangeRoleDialog
              userId={user.id}
              userName={user.name}
              currentRole={user.role}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Shield className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuItem>
            </ChangeRoleDialog>

            <DeleteUserDialog userId={user.id} userName={user.name}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteUserDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
