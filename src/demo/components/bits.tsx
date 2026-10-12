"use client";

import { ChevronDown, Lock, Medal as MedalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FEATURE_TIER, initials, type Feature, type SubStatus } from "../logic";
import { fmt } from "../i18n";
import { money } from "../format";
import { useDemo } from "../state";
import { MEDAL_COLOR, type Bi, type Medal } from "../data";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Ltr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block tabular-nums", className)}>
      {children}
    </span>
  );
}

/** A price in dinars. <bdi> keeps "30 د.أ" / "JD 30" reading correctly in either direction. */
export function Money({ n }: { n: number }) {
  const { lang } = useDemo();
  return <bdi className="tabular-nums">{money(n, lang)}</bdi>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "warn" | "good";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{value}</p>
          {sub && (
            <p
              className={cn(
                "mt-1 text-xs",
                tone === "good" && "text-emerald-600 dark:text-emerald-400",
                tone === "warn" && "text-amber-600 dark:text-amber-400",
                tone === "default" && "text-muted-foreground"
              )}
            >
              {sub}
            </p>
          )}
        </div>
        <div
          className={cn(
            "hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex",
            tone === "warn" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

const AVATAR_COLORS = [
  "bg-red-500/15 text-red-700 dark:text-red-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-pink-500/15 text-pink-700 dark:text-pink-300",
];

export function MemberAvatar({
  id,
  name,
  size = "md",
}: {
  id: string;
  name: Bi;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const { L } = useDemo();
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        AVATAR_COLORS[n % AVATAR_COLORS.length],
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        size === "xl" && "size-20 text-2xl"
      )}
    >
      {initials(L(name))}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubStatus | "paid" }) {
  const { d } = useDemo();
  const map = {
    active: ["bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", d.status.active],
    paid: ["bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", d.status.paid],
    expiring: ["bg-amber-500/15 text-amber-700 dark:text-amber-400", d.status.expiring],
    expired: ["bg-red-500/15 text-red-700 dark:text-red-400", d.status.expired],
  } as const;
  const [cls, label] = map[status];
  return (
    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap", cls)}>
      {label}
    </span>
  );
}

export function NativeSelect({
  value,
  onChange,
  children,
  className,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<"select">, "value" | "onChange">) {
  return (
    <div className={cn("relative", className)}>
      <select
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-input bg-background ps-3 pe-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/** Replaces a whole page when the current package does not include it. */
export function FeatureGate({ feature, children }: { feature: Feature; children: React.ReactNode }) {
  const { can, d, setPkg } = useDemo();
  if (can(feature)) return <>{children}</>;
  const tier = FEATURE_TIER[feature];
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="mb-5 flex size-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <Lock className="size-9" />
      </div>
      <h1 className="text-xl font-bold">
        {fmt(d.lock.title, { feature: d.features[feature], pkg: d.pkg[tier] })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{d.featureDesc[feature]}</p>
      <Button className="mt-6" size="lg" onClick={() => setPkg(tier)}>
        {fmt(d.lock.cta, { pkg: d.pkg[tier] })}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">{d.lock.hint}</p>
    </div>
  );
}

/** Small locked placeholder for a section inside a page. */
export function InlineLock({ feature }: { feature: Feature }) {
  const { d, setPkg } = useDemo();
  const tier = FEATURE_TIER[feature];
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lock className="size-5" />
      </div>
      <div>
        <p className="font-medium">{d.features[feature]}</p>
        <p className="text-xs text-muted-foreground">{fmt(d.lock.inline, { pkg: d.pkg[tier] })}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setPkg(tier)}>
        {fmt(d.lock.cta, { pkg: d.pkg[tier] })}
      </Button>
    </div>
  );
}

export function BarChart({
  data,
  format = (n: number) => String(n),
  height = 160,
  className,
}: {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data.map((x) => x.value), 1);
  return (
    <div className={cn("flex items-end gap-2 sm:gap-3", className)} style={{ height }}>
      {data.map((x, i) => {
        const last = i === data.length - 1;
        return (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
            <span className="text-center text-[11px] font-medium text-muted-foreground tabular-nums">
              {format(x.value)}
            </span>
            <div
              className={cn(
                "w-full rounded-t-md transition-all",
                last ? "bg-primary" : "bg-primary/35"
              )}
              style={{ height: `${Math.max(4, (x.value / max) * 100)}%`, minHeight: 4 }}
            />
            <span className="truncate text-center text-[11px] text-muted-foreground">{x.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function MedalChip({ medal }: { medal: Medal }) {
  const { d } = useDemo();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium whitespace-nowrap">
      <MedalIcon className="size-3.5" style={{ color: MEDAL_COLOR[medal] }} />
      {d.medal[medal]}
    </span>
  );
}
