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
import { useCurrentUser } from "@/features/auth/providers/use-auth.provider";

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
    href: "/dashboard",
    icon: BarChart3,
  },
];

const managementItems = [
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: PackagePlus,
  },
  {
    title: "Company",
    href: "/company",
    icon: Building2,
  },
  {
    title: "Users",
    href: "/users",
    icon: Building2,
  },
  {
    title: "Support Center",
    href: "/support",
    icon: Headset,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const user = useCurrentUser();

  console.log(user)

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r bg-background">
      <div className="border-b px-6 py-6">
        <div className="flex flex-col items-center text-center">
          {user.companyLogo ? (
            <img
              src={user.companyLogo}
              alt={user.companyName}
              width={64}
              height={64}
              className="object-contain"
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-8">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>

          <nav className="space-y-2">
            {operationalItems.map((item) => {
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
            {managementItems.map((item) => {
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
