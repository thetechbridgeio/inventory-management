// components/layout/header.tsx

"use client"

import { Bell, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
// import { useAuth } from "@/features/auth/context/auth.context"

export function Header() {
  // const { logout } = useAuth()
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-white/95 px-6 backdrop-blur">
      {/* Left */}
      <div>
        {/* <h1 className="text-xl font-bold tracking-tight">
          Inventory Management System
        </h1> */}
        <img src="/logo.png" alt="Logo" className="h-14" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-red-50 hover:text-red-600"
          // onClick={logout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
