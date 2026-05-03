"use client"

import React, { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { InventoryItem, PurchaseItem} from "@/lib/types"
import { SalesItem } from "@/features/sales/types/sale-entry-form.types"

type RowType = InventoryItem | SalesItem | PurchaseItem

interface DeleteSelectedButtonProps<T extends RowType> {
    sheetName: "Inventory" | "Purchase" | "Sales" | string
    selectedRows: T[]
    data: T[]
    setData: (data: T[]) => void
    setSelectedRows: (rows: T[]) => void
    clientId?: string
}

export function DeleteSelectedButton<T extends RowType>({
    sheetName,
    selectedRows,
    data,
    setData,
    setSelectedRows,
    clientId,
}: DeleteSelectedButtonProps<T>) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (selectedRows.length === 0) return

        try {
            setLoading(true)
            toast.loading("Deleting selected items...")

            const response = await fetch("/api/sheets/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sheetName,
                    items: selectedRows,
                    clientId,
                }),
            })

            const text = await response.text()

            let result
            try {
                result = JSON.parse(text)
            } catch {
                result = { error: "Invalid response format" }
            }

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete items")
            }

            // Update local state
            const updated = data.filter(
                (item) => !selectedRows.some((row) => row.srNo === item.srNo)
            )

            setData(updated)
            setSelectedRows([])

            toast.dismiss()
            toast.success(`${selectedRows.length} item(s) deleted`)
            setOpen(false)
        } catch (error: any) {
            console.error("Delete error:", error)
            toast.dismiss()
            toast.error(error.message || "Deletion failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Main Button */}
            <Button
                variant="destructive"
                disabled={selectedRows.length === 0}
                onClick={() => setOpen(true)}
                className="shadow-sm"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedRows.length})
            </Button>

            {/* Confirmation Dialog */}
            <Dialog open={open} onOpenChange={(val) => !loading && setOpen(val)}>
                <DialogContent
                    onInteractOutside={(e) => loading && e.preventDefault()}
                    onEscapeKeyDown={(e) => loading && e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {selectedRows.length} item(s)
                        </span>{" "}
                        from <span className="font-semibold">{sheetName}</span>?
                        <br />
                        This action cannot be undone.
                    </p>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}