"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
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

const operationalItems = [
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
] as const;

const managementItems = [
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
    title: "Support Center",
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

  const visibleOperationalItems = operationalItems.filter((item) =>
  ACCESS[item.access].includes(user.role),
);

const visibleManagementItems = managementItems.filter((item) =>
  ACCESS[item.access].includes(user.role),
);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r bg-background">
      <div className="border-b px-6 py-6">
        <div className="flex flex-col items-center text-center">
          {user.companyLogo ? (
            <img
              src={user.companyLogo}
              alt={user.companyName}
              className="object-contain h-16"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <h2 className="mt-3 line-clamp-1 text-sm font-semibold">
            {user.companyName}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">{user.name}</p>
          <Badge
            variant="outline"
            className={cn("mt-2 font-medium", roleBadge.className)}
          >
            {roleBadge.label}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-8">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>

          <nav className="space-y-2">
            {visibleOperationalItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>

          <nav className="space-y-2">
            {visibleManagementItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="rounded-xl bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-xs text-muted-foreground">Signed in as</p>

              <p className="truncate text-xs font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
