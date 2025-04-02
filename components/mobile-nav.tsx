"use client"

import { Home, ShoppingCart, TrendingUp, CreditCard, Users, Settings, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getPurchaseTerm, getSalesTerm } from "@/lib/client-terminology"

interface MobileNavProps {
  client?: {
    name: string
  }
}

export function MobileNav({ client }: MobileNavProps) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const items = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: getPurchaseTerm(client?.name), href: "/dashboard/purchase", icon: ShoppingCart },
    { name: getSalesTerm(client?.name), href: "/dashboard/sales", icon: TrendingUp },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="grid gap-4 py-4">
              <div className="px-3 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Avatar"} />
                        <AvatarFallback>{session?.user?.name?.slice(0, 2).toUpperCase() || "AV"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        signOut()
                        toast({
                          title: "Signed out",
                          description: "You have been signed out.",
                        })
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
              <div className="grid gap-2 px-3">
                {items.map((item) => (
                  <Button key={item.name} variant="ghost" className="justify-start" asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

