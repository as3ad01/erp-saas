import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  Settings,
} from "lucide-react";
import type { Module } from "@/generated/prisma/enums";
import type { Dictionary } from "@/i18n/get-dictionary";

export type NavItem = {
  key: keyof Dictionary["nav"];
  href: string;
  icon: LucideIcon;
  // Omitted for items always visible regardless of a company's module picks
  // (Dashboard, Settings). Present items are hidden unless that module is
  // enabled for the current company.
  module?: Module;
};

const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "inventory", href: "/inventory", icon: Package, module: "INVENTORY" },
  { key: "sales", href: "/sales", icon: ShoppingCart, module: "SALES" },
  { key: "purchasing", href: "/purchasing", icon: Truck, module: "PURCHASING" },
  { key: "accounting", href: "/accounting", icon: Wallet, module: "ACCOUNTING" },
  { key: "settings", href: "/settings", icon: Settings },
];

export function visibleNavItems(enabledModules: Module[]): NavItem[] {
  return navItems.filter((item) => !item.module || enabledModules.includes(item.module));
}
