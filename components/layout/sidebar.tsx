"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  Box,
  Boxes,
  Building2,
  Headset,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { ROLE_LABELS, ROLES } from "@/features/auth/constants/user-role";
import { Badge } from "../ui/badge";
import { ACCESS } from "@/features/auth/constants/access";

const sidebarItems = [
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
    access: "inventory",
  },
  {
    title: "Incomings",
    href: "/purchases",
    icon: ShoppingCart,
    access: "purchases",
  },
  {
    title: "Outgoings",
    href: "/sales",
    icon: PackageSearch,
    access: "sales",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    access: "dashboard",
  },
  {
    title: "Purchase",
    href: "/purchase-request",
    icon: Box,
    access: "purchaseRequest",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: PackagePlus,
    access: "suppliers",
  },
  {
    title: "Company",
    href: "/company",
    icon: Building2,
    access: "company",
  },
  {
    title: "Users",
    href: "/users",
    icon: Building2,
    access: "users",
  },
  {
    title: "Support",
    href: "/support",
    icon: Headset,
    access: "support",
  },
] as const;

const roleConfig = {
  [ROLES.SUPER_ADMIN]: {
    label: ROLE_LABELS.SUPER_ADMIN,
    className:
      "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50",
  },
  [ROLES.PURCHASE_ADMIN]: {
    label: ROLE_LABELS.PURCHASE_ADMIN,
    className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
  },
  [ROLES.STORE_ADMIN]: {
    label: ROLE_LABELS.STORE_ADMIN,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const roleBadge = roleConfig[user.role];

  const visibleItems = sidebarItems.filter((item) =>
    ACCESS[item.access].includes(user.role),
  );

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r bg-background">
      <div className="border-b px-5 py-5">
        <div className="flex flex-col items-center">
          {user.companyLogo ? (
            <img
              src={user.companyLogo}
              alt={user.companyName}
              className="h-14 object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
          )}

          <h2 className="mt-2 line-clamp-1 text-sm font-semibold">
            {user.companyName}
          </h2>

          <Badge
            variant="outline"
            className={cn("mt-2 text-[11px]", roleBadge.className)}
          >
            {roleBadge.label}
          </Badge>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <Truck className="h-4 w-4 text-muted-foreground" />

          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}