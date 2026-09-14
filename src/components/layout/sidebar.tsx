"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { visibleNavItems } from "./nav-items";
import type { Module } from "@/generated/prisma/enums";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Sidebar({
  companyName,
  enabledModules,
  dict,
}: {
  companyName: string;
  enabledModules: Module[];
  dict: Dictionary;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-e bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4 font-semibold truncate">
        {companyName}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {visibleNavItems(enabledModules).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {dict.nav[item.key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
