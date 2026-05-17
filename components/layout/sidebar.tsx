// components/layout/sidebar.tsx

"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  BarChart3,
  Boxes,
  Building2,
  Headset,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
  Truck,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/context/auth.context"

const operationalItems = [
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Incomings",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Outgoings",
    href: "/sales",
    icon: PackageSearch,
  },
  {
    title: "Dashboard",
    href: "/report",
    icon: BarChart3,
  },
]

const managementItems = [
  {
    title: "Supplier",
    href: "/suppliers",
    icon: PackagePlus,
    requiresAdmin: false,
  },
  {
    title: "Client Management",
    href: "/clients",
    icon: Building2,
    requiresAdmin: true,
  },
  {
    title: "Support Center",
    href: "/support",
    icon: Headset,
    requiresAdmin: false,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { client, initialized, isAdmin } = useAuth()

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72.5 flex-col border-r border-border/50 bg-white">
      {/* Header */}
      <div className="border-b border-border/50 px-6 pt-6 pb-3">
        <div className="flex flex-col items-center text-center">
          <img
            src={initialized && client ? client.logoUrl : "/default-logo.png"}
            alt="Company Logo"
            className="mb-4 h-16 w-auto object-contain"
          />
          <h1 className="font-bold tracking-tight">
            {initialized && client
              ? client.companyName
              : "Inventory Management"}
          </h1>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* OPERATIONS */}
        <div className="mb-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>

          <nav className="space-y-2">
            {operationalItems.map((item) => {
              const Icon = item.icon

              const isActive = pathname === item.href

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "group flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-black text-white shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-black"
                  )}
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        {/* ADMINISTRATION */}
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>

          <nav className="space-y-2">
            {managementItems
              .filter((item) => {
                if (!item.requiresAdmin) {
                  return true
                }

                return isAdmin
              })
              .map((item) => {
                const Icon = item.icon

                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-black text-white shadow-lg"
                        : "text-muted-foreground hover:bg-muted hover:text-black"
                    )}
                  >
                    <Icon className="h-5 w-5" />

                    <span>{item.title}</span>
                  </Link>
                )
              })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-5">
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Powered by</span>

              <span className="text-sm font-semibold tracking-tight">
                Business Coach Akhill M
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
