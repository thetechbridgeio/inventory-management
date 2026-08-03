"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDeleteUser } from "../hooks/use-delete-user";

type DeleteUserDialogProps = {
  userId: string;
  userName: string;
  children?: React.ReactNode;
};

export function DeleteUserDialog({
  userId,
  userName,
  children,
}: DeleteUserDialogProps) {
  const { mutateAsync, isPending } = useDeleteUser();

  async function handleDelete() {
    await mutateAsync(userId);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            className="
              text-red-600
              hover:bg-red-50
              hover:text-red-700
            "
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">This action cannot be undone.</span>

            <span className="block">
              User{" "}
              <span className="font-semibold text-foreground">
                {userName}
              </span>{" "}
              will be marked as inactive and will lose access to the
              company.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="
              bg-red-600
              text-white
              hover:bg-red-700
              focus:ring-red-600
            "
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
