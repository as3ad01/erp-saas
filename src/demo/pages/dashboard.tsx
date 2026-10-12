"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, Banknote, Clock, UserCheck, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ATTENDANCE_WEEK, BELTS, CLASSES, COACHES, REVENUE_SERIES, WEEK_DAYS } from "../data";
import { formatMonth, formatTime, plainNumber, relDays, weekdayName } from "../format";
import { fmt } from "../i18n";
import { useDemo } from "../state";
import { BarChart, Ltr, MemberAvatar, Money, PageHeader, ProgressBar, StatCard } from "../components/bits";
import { BeltChip } from "../components/belt";

export function DashboardPage() {
  const { d, L, lang, now, members, present, presentTotal, reminded, remind, can, parentById, revenueThisMonth } =
    useDemo();

  const finished = CLASSES.filter((c) => c.status === "done").length;
  const expiring = members
    .filter((m) => m.expiresInDays >= 0 && m.expiresInDays <= 7)
    .sort((a, b) => a.expiresInDays - b.expiresInDays);
  const rosterTotal = members.length;
  const prev = REVENUE_SERIES[REVENUE_SERIES.length - 2];
  const growth = Math.round(((REVENUE_SERIES[REVENUE_SERIES.length - 1] - prev) / prev) * 100);

  const revenueData = REVENUE_SERIES.map((v, i) => ({
    label: formatMonth(now, REVENUE_SERIES.length - 1 - i, lang),
    value: i === REVENUE_SERIES.length - 1 ? revenueThisMonth : v,
  }));
  const weekData = ATTENDANCE_WEEK.map((v, i) => ({
    label: weekdayName(WEEK_DAYS[i], lang),
    value: v,
  }));

  const beltCounts = BELTS.map((_, i) => members.filter((m) => m.belt === i).length);

  function sendReminder(id: string) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const parent = parentById(m.parentId);
    remind([id]);
    toast.success(
      fmt(can("parent") ? d.payments.sentWa : d.payments.sentSms, { parent: parent ? L(parent.name) : "" })
    );
  }

  return (
    <div>
      <PageHeader title={d.dash.title} subtitle={d.dash.subtitle} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label={d.dash.classes}
          value={CLASSES.length}
          sub={fmt(d.dash.classesSub, { n: finished })}
        />
        <StatCard
          icon={UserCheck}
          label={d.dash.attendance}
          value={presentTotal}
          sub={fmt(d.dash.attendanceSub, { n: rosterTotal })}
        />
        <StatCard
          icon={UserRoundX}
          tone="warn"
          label={d.dash.expiring}
          value={expiring.length}
          sub={d.dash.expiringSub}
        />
        <StatCard
          icon={Banknote}
          tone="good"
          label={d.dash.revenue}
          value={<Money n={revenueThisMonth} />}
          sub={<Ltr>{`+${growth}%`}</Ltr>}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{d.dash.classesTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CLASSES.map((c) => {
              const roster = members.filter((m) => m.classId === c.id).length;
              const here = present[c.id]?.length ?? 0;
              return (
                <Link
                  key={c.id}
                  href="/demo/check-in"
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-3 transition-colors hover:bg-muted/50",
                    c.status === "live" && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="w-20 shrink-0 text-center">
                    <div className="text-sm font-bold tabular-nums">
                      {formatTime(c.startH, c.startM, lang)}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {fmt(d.common.minutes, { n: 60 })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{L(c.name)}</span>
                      <ClassStatus status={c.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{L(COACHES[c.coachId].name)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={roster ? (here / roster) * 100 : 0} className="flex-1" />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {fmt(d.dash.present, { a: here, b: roster })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{d.dash.expiringTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiring.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">{d.dash.nothingExpiring}</p>
            )}
            {expiring.slice(0, 6).map((m) => {
              const done = reminded.includes(m.id);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <MemberAvatar id={m.id} name={m.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/demo/members/${m.id}`} className="block text-sm leading-snug font-medium hover:underline">
                      {L(m.name)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{relDays(m.expiresInDays, lang)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? "ghost" : "outline"}
                    disabled={done}
                    onClick={() => sendReminder(m.id)}
                  >
                    {done ? d.dash.reminded : d.dash.remind}
                  </Button>
                </div>
              );
            })}
            {expiring.length > 6 && (
              <Button variant="ghost" size="sm" className="w-full" render={<Link href="/demo/payments" />}>
                {d.dash.viewAll}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {d.dash.revenueTitle} ({d.common.currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={revenueData} format={plainNumber} height={190} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{d.dash.attendanceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={weekData} format={(n) => `${n}%`} height={190} />
          </CardContent>
        </Card>
      </div>

      {can("belts") && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{d.dash.beltsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              {BELTS.map((b, i) => (
                <div
                  key={b.id}
                  className="ring-1 ring-foreground/35 ring-inset"
                  style={{ width: `${(beltCounts[i] / members.length) * 100}%`, backgroundColor: b.color }}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {BELTS.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2 text-sm">
                  <BeltChip belt={i} />
                  <span className="font-semibold tabular-nums">{beltCounts[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClassStatus({ status }: { status: "done" | "live" | "upcoming" }) {
  const { d } = useDemo();
  const label = d.status[status];
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        status === "done" ? "bg-muted text-muted-foreground" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      )}
    >
      {label}
    </span>
  );
}
