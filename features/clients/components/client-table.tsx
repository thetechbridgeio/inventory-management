// features/clients/components/client-table.tsx

"use client"

import { useMemo, useState } from "react"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useClients } from "../hooks/use-clients"
import { DeleteClientButton } from "./delete-client-button"
import { useAuth } from "@/features/auth/context/auth.context"
import { SelectClientButton } from "./select-client-button"

const ITEMS_PER_PAGE = 10

export function ClientTable() {
  const { clients, loading } = useClients()
  const { client: activeClient } = useAuth()

  const [currentPage, setCurrentPage] = useState(1)

  const [search, setSearch] = useState("")

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchable = `
        ${client.companyName}
        ${client.contactPersonName}
        ${client.username}
        ${client.contactPersonEmail}
      `.toLowerCase()

      return searchable.includes(search.toLowerCase())
    })
  }, [clients, search])

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE

    return filteredClients.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredClients, currentPage])

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm mt-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-14 px-6 font-semibold">Company</TableHead>

              <TableHead className="px-6 font-semibold">
                Client Contact
              </TableHead>

              <TableHead className="px-6 font-semibold">Super Admin</TableHead>

              <TableHead className="px-6 font-semibold">Username</TableHead>

              <TableHead className="w-[80px] px-6 text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="space-y-1">
                    <p className="font-medium">No clients found</p>

                    <p className="text-sm text-muted-foreground">
                      Try a different keyword
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-b border-muted/50 hover:bg-muted/20"
                >
                  {/* Company */}
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          client.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />

                      <div className="space-y-1">
                        <p className="font-medium tracking-tight">
                          {client.companyName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {client.gstNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Client Contact */}
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium">{client.contactPersonName}</p>

                      <p className="text-sm text-muted-foreground">
                        {client.contactPersonEmail}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {client.contactPersonPhone}
                      </p>
                    </div>
                  </TableCell>

                  {/* Super Admin */}
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium">{client.superAdminName}</p>

                      <p className="text-sm text-muted-foreground">
                        {client.superAdminEmail}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {client.superAdminPhoneNumber}
                      </p>
                    </div>
                  </TableCell>

                  {/* Username */}
                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="font-medium">{client.username}</p>

                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-6 py-5 text-right flex justify-end gap-3 items-center">
                    {client.isActive && <SelectClientButton client={client} />}
                    <DeleteClientButton client={client} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {!loading && filteredClients.length > 0 && (
        <div className="flex flex-col gap-4 border-t bg-muted/10 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {paginatedClients.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredClients.length}
            </span>{" "}
            clients
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select
                value={String(currentPage)}
                onValueChange={(value) => setCurrentPage(Number(value))}
              >
                <SelectTrigger className="h-9 w-[120px] rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {Array.from({
                    length: totalPages,
                  }).map((_, index) => (
                    <SelectItem key={index} value={String(index + 1)}>
                      Page {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
