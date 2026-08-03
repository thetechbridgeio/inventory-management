"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateUserRole } from "../hooks/use-update-user-role";
import { ROLE_LABELS, UserRole } from "../../auth/constants/user-role";

type ChangeRoleDialogProps = {
  userId: string;
  userName: string;
  currentRole: UserRole;
  children?: React.ReactNode;
};

export function ChangeRoleDialog({
  userId,
  userName,
  currentRole,
  children,
}: ChangeRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(currentRole);
  const { mutateAsync, isPending } = useUpdateUserRole();

  async function handleSubmit() {
    if (role === currentRole) {
      setOpen(false);
      return;
    }

    await mutateAsync({ userId, role });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (value) {
          setRole(currentRole);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>

          <DialogDescription>
            Update the role for{" "}
            <span className="font-semibold text-foreground">
              {userName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>

          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
