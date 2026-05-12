// features/clients/components/select-client-button.tsx

"use client"

import { Check, Loader2 } from "lucide-react"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { createAuthClient } from "@/features/auth/handlers/auth.handlers"

import { useAuth } from "@/features/auth/context/auth.context"

import type { Client } from "../types/client.types"

type Props = {
  client: Client
}

export function SelectClientButton({ client }: Props) {
  const { client: activeClient, selectClient, loading } = useAuth()

  const authClient = useMemo(() => {
    return createAuthClient(client)
  }, [client])

  const selected = activeClient?.id === client.id

  return (
    <Button
      variant={selected ? "secondary" : "outline"}
      disabled={loading || selected}
      onClick={() => selectClient(authClient)}
      className={cn(
        "rounded-xl transition-colors",

        selected &&
          "border-green-200 bg-green-100 text-green-700 opacity-100 hover:bg-green-100 disabled:opacity-100 disabled:bg-green-100 disabled:text-green-700"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : selected ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Selected
        </>
      ) : (
        "Select"
      )}
    </Button>
  )
}
