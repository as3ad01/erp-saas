"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CalendarPlus, MapPin, Medal as MedalIcon, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COMP_RESULTS, EVENTS, MEDAL_COLOR, type Medal } from "../data";
import { formatDate, relDays } from "../format";
import { fmt } from "../i18n";
import { useDemo } from "../state";
import { MedalChip, MemberAvatar, PageHeader } from "../components/bits";

export function CompetitionsPage() {
  const { d, L, lang, now, memberById } = useDemo();
  const upcoming = EVENTS.filter((e) => e.inDays > 0);
  const past = EVENTS.filter((e) => e.inDays < 0);
  const tally = (["gold", "silver", "bronze"] as Medal[]).map((m) => ({
    m,
    n: COMP_RESULTS.filter((r) => r.medal === m).length,
  }));
  const rank: Record<Medal, number> = { gold: 0, silver: 1, bronze: 2, participation: 3 };
  const latest = [...COMP_RESULTS]
    .filter((r) => r.medal !== "participation")
    .sort((a, b) => {
      const ea = EVENTS.find((e) => e.id === a.eventId)!;
      const eb = EVENTS.find((e) => e.id === b.eventId)!;
      return eb.inDays - ea.inDays || rank[a.medal] - rank[b.medal];
    })
    .slice(0, 10);

  return (
    <div>
      <PageHeader title={d.comps.title} subtitle={d.comps.subtitle} />

      <div className="grid gap-4 sm:grid-cols-3">
        {tally.map(({ m, n }) => (
          <Card key={m}>
            <CardContent className="flex items-center gap-4">
              <span
                className="flex size-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${MEDAL_COLOR[m]}26` }}
              >
                <MedalIcon className="size-6" style={{ color: MEDAL_COLOR[m] }} />
              </span>
              <div>
                <p className="text-3xl font-bold tabular-nums">{n}</p>
                <p className="text-sm text-muted-foreground">{d.medal[m]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">{d.comps.upcoming}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {upcoming.map((e, i) => (
          <Card key={e.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <Trophy className="size-4 text-amber-500" />
                    {L(e.name)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {L(e.place)}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {relDays(e.inDays, lang)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(now, -e.inDays, lang)} · {fmt(d.comps.registered, { n: 9 + i * 7 })}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(fmt(d.comps.registerToast, { event: L(e.name) }))}
              >
                <CalendarPlus />
                {d.comps.register}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 py-0">
        <CardHeader className="pt-4">
          <CardTitle>{d.comps.topResults}</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">{d.comps.colStudent}</TableHead>
              <TableHead>{d.comps.colEvent}</TableHead>
              <TableHead className="pe-4">{d.comps.colResult}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latest.map((r, i) => {
              const m = memberById(r.memberId);
              const ev = EVENTS.find((e) => e.id === r.eventId)!;
              if (!m) return null;
              return (
                <TableRow key={i}>
                  <TableCell className="py-3 ps-4">
                    <div className="flex items-center gap-3">
                      <MemberAvatar id={m.id} name={m.name} size="sm" />
                      <Link href={`/demo/members/${m.id}`} className="font-medium hover:underline">
                        {L(m.name)}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {L(ev.name)} · {d.category[r.category]}
                  </TableCell>
                  <TableCell className="pe-4">
                    <MedalChip medal={r.medal} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-semibold">{d.comps.past}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {past.map((e) => {
          const res = COMP_RESULTS.filter((r) => r.eventId === e.id && r.medal !== "participation");
          return (
            <Card key={e.id} size="sm">
              <CardContent>
                <p className="font-semibold">{L(e.name)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(now, -e.inDays, lang)}</p>
                <p className="mt-2 text-sm font-medium text-primary">{fmt(d.comps.total, { n: res.length })}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
