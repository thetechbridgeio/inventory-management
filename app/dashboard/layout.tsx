"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Header from "@/components/header"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Package, ShoppingCart, TrendingUp, Settings, HelpCircle, LayoutDashboard, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
    }

    // Check if user is admin
    const userRole = sessionStorage.getItem("userRole")
    setIsAdmin(userRole === "admin")
  }, [router])

  if (!mounted) return null

  const navigation = [
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Purchase", href: "/dashboard/purchase", icon: ShoppingCart },
    { name: "Sales", href: "/dashboard/sales", icon: TrendingUp },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Support", href: "/dashboard/support", icon: HelpCircle },
    // Only show Clients link for admin users
    ...(isAdmin ? [{ name: "Clients", href: "/dashboard/clients", icon: Users }] : []),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="sticky top-16 z-30 bg-blue-50/80 backdrop-blur supports-[backdrop-filter]:bg-blue-50/60">
        <div className="container mx-auto">
          <nav className="flex justify-center md:justify-start">
            {navigation.map((item) => {
              const isActive =
                (item.href === "/dashboard" && pathname === "/dashboard") ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center py-4 px-6 relative transition-colors",
                    isActive ? "text-[#3174d3] bg-[#edf4fc]" : "text-gray-500 hover:text-gray-700 hover:bg-blue-50/50",
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5 mr-2", isActive ? "text-[#3174d3]" : "text-gray-400")}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#3174d3]"></div>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      <main className="flex-1 container py-6 md:py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">{children}</main>
      <footer className="py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by Akhill M Business Coach
        </div>
      </footer>
      <Toaster />
    </div>
  )
}

