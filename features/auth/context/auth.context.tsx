// features/auth/context/auth.context.tsx

"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { toast } from "sonner"

import { useRouter } from "next/navigation"

import {
  clearClientSession,
  createAuthClient,
  getClientSession,
  isAdminClient,
  saveClientSession,
  validateLogin,
} from "../handlers/auth.handlers"

import type { AuthClient, LoginCredentials } from "../types/auth.types"
import { useClients } from "@/features/clients/hooks/use-clients"

type AuthContextType = {
  client: AuthClient | null

  authenticated: boolean

  loading: boolean
  selectClient: (client: AuthClient) => void

  initialized: boolean
  isAdmin: boolean

  login: (credentials: LoginCredentials) => Promise<boolean>

  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { clients, loading } = useClients()

  const [client, setClient] = useState<AuthClient | null>(null)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const storedClient = getClientSession()

    if (storedClient) {
      setClient(storedClient)
    }

    setInitialized(true)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const validatedClient = validateLogin(clients, credentials)

        if (!validatedClient) {
          toast.error("Invalid username or password")

          return false
        }

        const authClient = createAuthClient(validatedClient)

        saveClientSession(authClient)

        setClient(authClient)

        toast.success("Login successful")

        router.push("/inventory")

        return true
      } catch (error) {
        console.error(error)

        toast.error("Failed to login")

        return false
      }
    },
    [clients, router]
  )

  const logout = useCallback(() => {
    clearClientSession()

    setClient(null)

    toast.success("Logged out successfully")

    router.push("/")
  }, [router])

  const selectClient = useCallback(
    (client: AuthClient) => {
      saveClientSession(client)

      setClient(client)

      toast.success(`${client.companyName} selected`)

      router.refresh()
    },
    [router]
  )

  const value = useMemo(
    () => ({
      client,

      authenticated: !!client,

      loading,
      isAdmin: isAdminClient(client),

      selectClient,

      initialized,

      login,

      logout,
    }),
    [client, loading, initialized, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
