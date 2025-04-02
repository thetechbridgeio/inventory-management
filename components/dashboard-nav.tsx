import { Home, ShoppingCart, TrendingUp } from "lucide-react"
import { getPurchaseTerm, getSalesTerm } from "@/lib/client-terminology"

interface NavItem {
  name: string
  href: string
  icon: any // Replace 'any' with a more specific type if possible
}

interface DashboardNavProps {
  client?: { name: string | null | undefined }
}

export function DashboardNav({ client }: DashboardNavProps) {
  const items: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: getPurchaseTerm(client?.name), href: "/dashboard/purchase", icon: ShoppingCart },
    { name: getSalesTerm(client?.name), href: "/dashboard/sales", icon: TrendingUp },
  ]

  return (
    <nav>
      <ul className="flex flex-col space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

