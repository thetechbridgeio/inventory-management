"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, Bell, Search, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useClientContext } from "@/context/client-context"

export default function Header() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { client } = useClientContext()

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn")
    sessionStorage.removeItem("clientId")
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between">
        {/* Left side with logo and title */}
        <div className="flex items-center" style={{ marginLeft: "40px" }}>
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <Image
            src={client?.logoUrl || "/images/default-logo.png"}
            alt="Client Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />

          <h1 className="text-xl font-bold hidden md:block ml-4">Inventory Management</h1>

          {isMobileMenuOpen && (
            <SheetContent side="left" className="pr-0" onClose={() => setIsMobileMenuOpen(false)}>
              <div className="px-7">
                <Image
                  src={client?.logoUrl || "/images/default-logo.png"}
                  alt="Client Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div className="font-semibold mt-4 mb-2">Navigation</div>
              </div>
              <nav className="grid gap-1 px-2">
                {[
                  { name: "Inventory", path: "/dashboard/inventory" },
                  { name: "Purchase", path: "/dashboard/purchase" },
                  { name: "Sales", path: "/dashboard/sales" },
                  { name: "Dashboard", path: "/dashboard" },
                  { name: "Settings", path: "/dashboard/settings" },
                  { name: "Support", path: "/dashboard/support" },
                ].map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      router.push(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          )}
        </div>

        {/* Right side with search, notifications, and profile */}
        <div className="flex items-center gap-4 mr-8">
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[300px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">2</Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Information</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { title: "Low stock alert", desc: "Automatically send everyday", time: "6 pm" },
                { title: "Daily Updates", desc: "Automatically send everyday", time: "6 pm" },
              ].map((notification, i) => (
                <DropdownMenuItem key={i} className="cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.desc}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

