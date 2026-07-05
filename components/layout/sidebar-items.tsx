import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Box,
  Boxes,
  Building2,
  Headset,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
} from "lucide-react";

import { ACCESS } from "@/features/auth/constants/access";

export type SidebarItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  access: keyof typeof ACCESS;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
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
];