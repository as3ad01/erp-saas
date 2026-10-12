"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BellRing, CircleDollarSign, HandCoins, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PLAN_PRICE, type Member } from "../data";
import { money, relDays } from "../format";
import { fmt } from "../i18n";
import { subStatus } from "../logic";
import { useDemo } from "../state";
import { Ltr, MemberAvatar, PageHeader, StatCard, StatusBadge } from "../components/bits";

type Filter = "all" | "soon" | "overdue";

export function PaymentsPage() {
  const { d, L, lang, members, reminded, remind, pay, can, parentById, revenueThisMonth } = useDemo();
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = [...members].sort((a, b) => a.expiresInDays - b.expiresInDays);
  const rows = sorted.filter((m) => {
    if (filter === "soon") return m.expiresInDays >= 0 && m.expiresInDays <= 7;
    if (filter === "overdue") return m.expiresInDays < 0;
    return true;
  });

  const dueMembers = members.filter((m) => m.expiresInDays <= 7);
  const outstanding = dueMembers.reduce((n, m) => n + PLAN_PRICE[m.plan], 0);
  const activeCount = members.filter((m) => m.expiresInDays >= 0).length;
  const waiting = dueMembers.filter((m) => !reminded.includes(m.id));

  function parentName(m: Member) {
    const p = parentById(m.parentId);
    return p ? L(p.name) : "";
  }

  function sendOne(m: Member) {
    remind([m.id]);
    toast.success(fmt(can("parent") ? d.payments.sentWa : d.payments.sentSms, { parent: parentName(m) }));
  }

  function sendAll() {
    if (waiting.length === 0) {
      toast(d.payments.nobody);
      return;
    }
    remind(waiting.map((m) => m.id));
    toast.success(fmt(can("parent") ? d.payments.bulkWa : d.payments.bulkSms, { n: waiting.length }));
  }

  function record(m: Member) {
    pay(m.id);
    toast.success(fmt(d.payments.recorded, { amount: PLAN_PRICE[m.plan], name: L(m.name) }));
  }

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: d.payments.tabAll },
    { id: "soon", label: d.payments.tabSoon },
    { id: "overdue", label: d.payments.tabOverdue },
  ];

  return (
    <div>
      <PageHeader
        title={d.payments.title}
        subtitle={d.payments.subtitle}
        actions={
          <Button onClick={sendAll}>
            <BellRing />
            {d.payments.remindAll}
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard icon={HandCoins} tone="warn" label={d.payments.outstanding} value={<Ltr>{money(outstanding)}</Ltr>} />
        <StatCard icon={CircleDollarSign} tone="good" label={d.payments.collected} value={<Ltr>{money(revenueThisMonth)}</Ltr>} />
        <StatCard icon={UsersRound} label={d.payments.activeSubs} value={activeCount} />
      </div>

      <div className="mb-3 inline-flex gap-0.5 rounded-full border bg-muted p-0.5 text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              filter === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="hidden py-0 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-11 ps-4">{d.payments.colMember}</TableHead>
              <TableHead>{d.payments.colPlan}</TableHead>
              <TableHead>{d.payments.colAmount}</TableHead>
              <TableHead>{d.payments.colEnds}</TableHead>
              <TableHead>{d.payments.colStatus}</TableHead>
              <TableHead className="pe-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 40).map((m) => {
              const st = subStatus(m);
              const due = st !== "active";
              const done = reminded.includes(m.id);
              return (
                <TableRow key={m.id}>
                  <TableCell className="py-3 ps-4">
                    <div className="flex items-center gap-3">
                      <MemberAvatar id={m.id} name={m.name} size="sm" />
                      <Link href={`/demo/members/${m.id}`} className="font-medium hover:underline">
                        {L(m.name)}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{d.plan[m.plan]}</TableCell>
                  <TableCell className="font-medium">
                    <Ltr>{money(PLAN_PRICE[m.plan])}</Ltr>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{relDays(m.expiresInDays, lang)}</TableCell>
                  <TableCell>
                    <StatusBadge status={st} />
                  </TableCell>
                  <TableCell className="pe-4">
                    {due && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" disabled={done} onClick={() => sendOne(m)}>
                          {done ? d.dash.reminded : d.payments.remind}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => record(m)}>
                          {d.payments.markPaid}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="space-y-2 md:hidden">
        {rows.slice(0, 40).map((m) => {
          const st = subStatus(m);
          const due = st !== "active";
          const done = reminded.includes(m.id);
          return (
            <Card key={m.id} size="sm" className="px-3">
              <div className="flex items-center gap-3">
                <MemberAvatar id={m.id} name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{L(m.name)}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.plan[m.plan]} · <Ltr>{money(PLAN_PRICE[m.plan])}</Ltr> · {relDays(m.expiresInDays, lang)}
                  </p>
                </div>
                <StatusBadge status={st} />
              </div>
              {due && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" disabled={done} onClick={() => sendOne(m)}>
                    {done ? d.dash.reminded : d.payments.remind}
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => record(m)}>
                    {d.payments.markPaid}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
