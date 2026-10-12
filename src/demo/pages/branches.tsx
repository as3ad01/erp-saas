"use client";

import { toast } from "sonner";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCHES, PLAN_DAYS, PLAN_PRICE } from "../data";
import { money } from "../format";
import { useDemo } from "../state";
import { BarChart, Ltr, PageHeader, ProgressBar } from "../components/bits";

export function BranchesPage() {
  const { d, L, members } = useDemo();

  const rows = BRANCHES.map((b) => {
    const list = members.filter((m) => m.branchId === b.id);
    const revenue = list.reduce((n, m) => n + Math.round((PLAN_PRICE[m.plan] / PLAN_DAYS[m.plan]) * 30), 0);
    return {
      b,
      count: list.length,
      revenue,
      att: list.length ? Math.round(list.reduce((n, m) => n + m.attendance, 0) / list.length) : 0,
      expiring: list.filter((m) => m.expiresInDays >= 0 && m.expiresInDays <= 7).length,
    };
  });

  return (
    <div>
      <PageHeader
        title={d.branches.title}
        subtitle={d.branches.subtitle}
        actions={
          <Button variant="outline" onClick={() => toast(d.branches.addToast)}>
            <Plus />
            {d.branches.add}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {rows.map(({ b, count, revenue, att, expiring }) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {L(b.name)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{L(b.area)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label={d.branches.members} value={count} />
              <Row label={d.branches.revenue} value={<Ltr>{money(revenue)}</Ltr>} />
              <Row label={d.branches.attendance} value={`${att}%`} />
              <Row label={d.branches.expiring} value={expiring} />
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{d.branches.share}</p>
                <ProgressBar value={(count / members.length) * 100} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{d.branches.members}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={rows.map((r) => ({ label: L(r.b.name), value: r.count }))} height={180} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{d.branches.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={rows.map((r) => ({ label: L(r.b.name), value: r.revenue }))} format={money} height={180} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
