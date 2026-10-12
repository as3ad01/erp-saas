"use client";

import { toast } from "sonner";
import { Download, Gauge, Repeat, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BELTS, CLASSES, NEW_MEMBERS_SERIES, REVENUE_SERIES } from "../data";
import { formatMonth, plainNumber } from "../format";
import { useDemo } from "../state";
import { BarChart, PageHeader, ProgressBar, StatCard } from "../components/bits";
import { BeltChip } from "../components/belt";

export function ReportsPage() {
  const { d, L, lang, now, members, revenueThisMonth, addedCount } = useDemo();

  const active = members.filter((m) => m.expiresInDays >= 0).length;
  const tracked = members.filter((m) => m.attendance > 0);
  const avgAtt = Math.round(tracked.reduce((n, m) => n + m.attendance, 0) / Math.max(1, tracked.length));
  const mature = members.filter((m) => m.joinedDaysAgo > 90);
  const retention = Math.round((mature.filter((m) => m.expiresInDays >= 0).length / Math.max(1, mature.length)) * 100);

  const revenue = REVENUE_SERIES.map((v, i) => ({
    label: formatMonth(now, REVENUE_SERIES.length - 1 - i, lang),
    value: i === REVENUE_SERIES.length - 1 ? revenueThisMonth : v,
  }));
  const joins = NEW_MEMBERS_SERIES.map((v, i) => ({
    label: formatMonth(now, NEW_MEMBERS_SERIES.length - 1 - i, lang),
    value: i === NEW_MEMBERS_SERIES.length - 1 ? v + addedCount : v,
  }));

  const byClass = CLASSES.map((c) => {
    const list = members.filter((m) => m.classId === c.id && m.attendance > 0);
    return { c, avg: list.length ? Math.round(list.reduce((n, m) => n + m.attendance, 0) / list.length) : 0, n: list.length };
  });
  const plans = (["monthly", "quarterly", "annual"] as const).map((p) => ({
    p,
    n: members.filter((m) => m.plan === p).length,
  }));

  return (
    <div>
      <PageHeader
        title={d.reports.title}
        subtitle={d.reports.subtitle}
        actions={
          <Button variant="outline" onClick={() => toast.success(d.reports.exported)}>
            <Download />
            {d.reports.export}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={d.reports.totalMembers} value={members.length} />
        <StatCard icon={Gauge} label={d.reports.activeRate} value={`${Math.round((active / members.length) * 100)}%`} />
        <StatCard icon={UserCheck} label={d.reports.avgAttendance} value={`${avgAtt}%`} />
        <StatCard icon={Repeat} tone="good" label={d.reports.retention} value={`${retention}%`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {d.reports.revenueTitle} ({d.common.currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={revenue} format={plainNumber} height={200} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{d.reports.newMembersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={joins} height={200} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{d.reports.byClass}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byClass.map(({ c, avg }) => (
              <div key={c.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{L(c.name)}</span>
                  <span className="font-semibold tabular-nums">{avg}%</span>
                </div>
                <ProgressBar value={avg} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{d.reports.beltsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {BELTS.map((b, i) => {
              const n = members.filter((m) => m.belt === i).length;
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <BeltChip belt={i} className="w-28 shrink-0" />
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full ring-1 ring-foreground/35 ring-inset"
                      style={{ width: `${(n / members.length) * 100 * 2.2}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <span className="w-6 text-end text-sm font-semibold tabular-nums">{n}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{d.reports.planMix}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {plans.map(({ p, n }) => (
              <div key={p} className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">{d.plan[p]}</p>
                <p className="text-2xl font-bold tabular-nums">{n}</p>
                <ProgressBar value={(n / members.length) * 100} className="mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
