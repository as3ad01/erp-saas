"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { visibleNavItems } from "./nav-items";
import type { Module } from "@/generated/prisma/enums";
import type { Dictionary } from "@/i18n/get-dictionary";
import { isRtl, type Locale } from "@/i18n/config";

export function MobileNav({
  companyName,
  enabledModules,
  dict,
  locale,
}: {
  companyName: string;
  enabledModules: Module[];
  dict: Dictionary;
  locale: Locale;
}) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side={isRtl(locale) ? "right" : "left"} className="w-64 p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="truncate">{companyName}</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-3">
          {visibleNavItems(enabledModules).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {dict.nav[item.key]}
                  </Link>
                }
              />
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
