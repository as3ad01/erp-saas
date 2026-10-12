"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Building2,
  CheckCheck,
  CreditCard,
  Globe,
  LayoutDashboard,
  Lock,
  Menu,
  RotateCcw,
  Smartphone,
  Trophy,
  Users,
  ChartColumn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { CLUB, type Tier } from "../data";
import type { Feature } from "../logic";
import type { Dict } from "../i18n";
import { useDemo } from "../state";
import { Logo } from "./logo";

type NavItem = {
  key: keyof Dict["nav"];
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: Feature;
};

const GROUPS: { tier: Tier | null; items: NavItem[] }[] = [
  {
    tier: null,
    items: [
      { key: "dashboard", href: "/demo", icon: LayoutDashboard },
      { key: "members", href: "/demo/members", icon: Users },
      { key: "checkin", href: "/demo/check-in", icon: CheckCheck },
      { key: "payments", href: "/demo/payments", icon: CreditCard },
    ],
  },
  {
    tier: "standard",
    items: [
      { key: "belts", href: "/demo/belts", icon: Award, feature: "belts" },
      { key: "parent", href: "/demo/parent", icon: Smartphone, feature: "parent" },
      { key: "reports", href: "/demo/reports", icon: ChartColumn, feature: "reports" },
    ],
  },
  {
    tier: "pro",
    items: [
      { key: "competitions", href: "/demo/competitions", icon: Trophy, feature: "competitions" },
      { key: "branches", href: "/demo/branches", icon: Building2, feature: "branches" },
      { key: "website", href: "/demo/website", icon: Globe, feature: "website" },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: (children: React.ReactElement) => React.ReactElement }) {
  const pathname = usePathname();
  const { d, can } = useDemo();

  return (
    <nav className="space-y-5 p-3">
      {GROUPS.map((g, gi) => (
        <div key={gi} className="space-y-1">
          {g.tier && (
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
              {d.pkg[g.tier]}
            </p>
          )}
          {g.items.map((item) => {
            const active =
              item.href === "/demo" ? pathname === "/demo" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const locked = item.feature ? !can(item.feature) : false;
            const Icon = item.icon;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  locked && !active && "text-sidebar-foreground/40"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{d.nav[item.key]}</span>
                {locked && <Lock className="size-3.5 shrink-0 opacity-70" />}
              </Link>
            );
            return onNavigate ? <div key={item.href}>{onNavigate(link)}</div> : link;
          })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const { L } = useDemo();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <Logo />
        <span className="truncate text-sm leading-tight font-bold">{L(CLUB.name)}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { L, dir } = useDemo();
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent
        side={dir === "rtl" ? "right" : "left"}
        className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-sidebar-border">
          <Logo />
          <SheetTitle className="text-sidebar-foreground">{L(CLUB.name)}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto">
          <NavList onNavigate={(link) => <SheetClose render={link} />} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PackageSwitcher({ className }: { className?: string }) {
  const { pkg, setPkg, d } = useDemo();
  const tiers: Tier[] = ["basic", "standard", "pro"];
  return (
    <div
      role="group"
      aria-label={d.pkg.label}
      className={cn("flex items-center gap-0.5 rounded-full border bg-muted p-0.5 text-sm", className)}
    >
      {tiers.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setPkg(t)}
          className={cn(
            "flex-1 rounded-full px-3 py-1 text-center whitespace-nowrap transition-colors",
            pkg === t
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {d.pkg[t]}
        </button>
      ))}
    </div>
  );
}

export function DemoLangToggle() {
  const { lang, setLang } = useDemo();
  const opts = [
    { v: "ar" as const, label: "عربي" },
    { v: "en" as const, label: "EN" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-input bg-muted p-0.5 text-sm">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => setLang(o.v)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            lang === o.v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Topbar() {
  const { L, d, reset } = useDemo();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav />
          <Logo className="size-7 md:hidden" />
          <span className="hidden truncate text-sm font-semibold sm:inline md:hidden">{L(CLUB.name)}</span>
          <PackageSwitcher className="hidden md:flex" />
          <Badge variant="secondary" className="hidden lg:inline-flex">
            {d.app.demo}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DemoLangToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={d.app.reset}
            title={d.app.reset}
            onClick={() => {
              reset();
              toast(d.app.resetDone);
            }}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-2 md:hidden">
        <PackageSwitcher className="w-full" />
      </div>
    </header>
  );
}
