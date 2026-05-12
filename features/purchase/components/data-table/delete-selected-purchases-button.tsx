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
import { Purchase } from "../../types/purchase.types"
import { usePurchasesContext } from "../../context/purchase-provider"

type Props = {
  selectedItems: Purchase[]
}

export function DeleteSelectedPurchasesButton({ selectedItems }: Props) {
  const [open, setOpen] = useState(false)

  const [deletingAll, setDeletingAll] = useState(false)

  const { deletePurchase } = usePurchasesContext()

  const disabled = useMemo(() => {
    return deletingAll || selectedItems.length === 0
  }, [deletingAll, selectedItems.length])

  const handleDelete = async () => {
    try {
      setDeletingAll(true)

      const results = await Promise.all(
        selectedItems.map(async (item) => deletePurchase(item))
      )

      const failedDeletes = results.filter((result) => !result)

      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} purchase(s)`)

        return
      }

      toast.success(`${selectedItems.length} purchase(s) deleted successfully`)

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to delete selected purchases")
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
          className="rounded-xl"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Purchases</AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              handleDelete()
            }}
          >
            {deletingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
