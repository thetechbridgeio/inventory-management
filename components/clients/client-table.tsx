"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Client } from "@/lib/types"

interface Props {
  clients: Client[]
  selectedClient: Client | null
  onSelect: (client: Client) => void
}

export function ClientTable({
  clients,
  selectedClient,
  onSelect,
}: Props) {
  if (!clients.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          No clients found. Add your first client to get started.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Super Admin</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Sheet ID</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {clients.map((client) => {
          const isSelected = selectedClient?.id === client.id

          return (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.name}
              </TableCell>

              <TableCell>{client.email}</TableCell>

              <TableCell>
                {client.superAdminEmail || (
                  <span className="text-xs text-muted-foreground">
                    Not set
                  </span>
                )}
              </TableCell>

              <TableCell>{client.username}</TableCell>

              <TableCell>
                {client.sheetId ? (
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {client.sheetId.length > 15
                      ? client.sheetId.slice(0, 15) + "..."
                      : client.sheetId}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not set
                  </span>
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onSelect(client)}
                >
                  {isSelected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}