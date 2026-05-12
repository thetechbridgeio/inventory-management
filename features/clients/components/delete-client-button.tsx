// features/clients/components/delete-client-button.tsx

"use client"

import { useState } from "react"

import { Loader2, Trash2 } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

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
} from "@/components/ui/alert-dialog"

import type { Client } from "../types/client.types"
import { useClients } from "../hooks/use-clients"

type Props = {
  client: Client
}

export function DeleteClientButton({ client }: Props) {
  const [open, setOpen] = useState(false)

  const { deleteClient, deleting } = useClients()

  const handleDelete = async () => {
    try {
      const success = await deleteClient(client)

      if (!success) {
        return
      }

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to delete client")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive" className="rounded-xl">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>

          <AlertDialogDescription className="space-y-3">
            <span className="block">This action cannot be undone.</span>

            <span className="block">
              This will permanently remove the client{" "}
              <span className="font-semibold text-foreground">
                {client.companyName}
              </span>{" "}
              and all associated references from the system.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Company</span>

              <span className="text-sm font-medium">{client.companyName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Client ID</span>

              <span className="text-sm font-medium">{client.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sheet ID</span>

              <span className="max-w-[220px] truncate text-sm font-medium">
                {client.sheetId}
              </span>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting} className="rounded-xl">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault()

              handleDelete()
            }}
            className="rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
