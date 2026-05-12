// features/inventory/components/delete-selected-inventory-button.tsx

"use client"

import { useMemo, useState } from "react"

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
import { Inventory } from "../../types/inventory.types"
import { useInventoryContext } from "../../context/inventory-provider"

type Props = {
  selectedItems: Inventory[]
}

export function DeleteSelectedInventoryButton({ selectedItems }: Props) {
  const [open, setOpen] = useState(false)

  const [deletingAll, setDeletingAll] = useState(false)

  const { deleteInventory } = useInventoryContext()

  const disabled = useMemo(() => {
    return deletingAll || selectedItems.length === 0
  }, [deletingAll, selectedItems.length])

  const handleDelete = async () => {
    try {
      setDeletingAll(true)

      const results = await Promise.all(
        selectedItems.map(async (item) => deleteInventory(item))
      )

      const failedDeletes = results.filter((result) => !result)

      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} item(s)`)

        return
      }

      toast.success(
        `${selectedItems.length} inventory item(s) deleted successfully`
      )

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to delete selected inventory")
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={disabled}
          className="rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
          {selectedItems.length > 0 && (
            <span className="ml-1">({selectedItems.length})</span>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Inventory</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              {selectedItems.length} inventory item(s)
            </span>{" "}
            from your inventory system.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-48 overflow-y-auto rounded-2xl border bg-muted/30 p-4">
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div
                key={`${item.product}-${item.timestamp}`}
                className="flex items-center justify-between rounded-xl border bg-background px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.product}</span>

                  <span className="text-xs text-muted-foreground">
                    {item.category}
                  </span>
                </div>

                <span className="text-xs text-muted-foreground">
                  Stock: {item.stock}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletingAll} className="rounded-xl">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={deletingAll}
            onClick={(event) => {
              event.preventDefault()

              handleDelete()
            }}
            className="rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:text-white/70"
          >
            {deletingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Items
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
