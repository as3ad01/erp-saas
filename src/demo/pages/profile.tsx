"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, CalendarCheck, CheckCheck, Medal as MedalIcon, MessageCircle, Phone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BELTS,
  BRANCHES,
  CLASSES,
  COACHES,
  COMP_RESULTS,
  EVENTS,
  PLAN_PRICE,
  attendanceHistory,
} from "../data";
import { formatDate, formatDay, formatMonthYear, formatWeekday, money, relDays, years } from "../format";
import { fmt } from "../i18n";
import { isEligible, subStatus } from "../logic";
import { useDemo } from "../state";
import { BeltChip, BeltGraphic } from "../components/belt";
import { InlineLock, Ltr, MedalChip, MemberAvatar, Money, StatusBadge } from "../components/bits";
import { ExpiredCheckInDialog } from "../components/expired-dialog";
import { NoteDialog } from "../components/note-dialog";

export function ProfilePage({ id }: { id: string }) {
  const { d, L, lang, dir, now, memberById, parentById, can, present, checkIn, undoCheckIn } = useDemo();
  const m = memberById(id);
  const [confirming, setConfirming] = useState(false);
  const [noting, setNoting] = useState(false);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (!m) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-muted-foreground">{d.profile.notFound}</p>
        <Link href="/demo/members" className={buttonVariants({ variant: "outline" })}>
          {d.profile.back}
        </Link>
      </div>
    );
  }

  const parent = parentById(m.parentId);
  const cls = CLASSES.find((c) => c.id === m.classId)!;
  const branch = BRANCHES.find((b) => b.id === m.branchId)!;
  const here = present[m.classId]?.includes(m.id) ?? false;
  const history = attendanceHistory(m, now);
  const medals = COMP_RESULTS.filter((r) => r.memberId === m.id);
  const eligible = isEligible(m);
  const sessions = Math.round((m.attendance / 100) * 12);

  function doCheckIn() {
    checkIn(m!.id);
    toast.success(fmt(can("parent") ? d.checkin.toastWa : d.checkin.toast, { name: L(m!.name) }));
  }

  return (
    <div>
      <Link
        href="/demo/members"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Back className="size-4" />
        {d.profile.back}
      </Link>

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <MemberAvatar id={m.id} name={m.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{L(m.name)}</h1>
              {can("belts") && <BeltChip belt={m.belt} />}
              <StatusBadge status={subStatus(m)} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {years(m.age, lang)} · {L(cls.name)}
              {can("branches") && <> · {L(branch.name)}</>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmt(d.profile.joined, { when: formatMonthYear(now, m.joinedDaysAgo, lang) })}
            </p>
            {parent && (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-muted-foreground">{d.profile.parent}:</span>
                <span className="font-medium">{L(parent.name)}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Phone className="size-3.5" />
                  <Ltr>{parent.phone}</Ltr>
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-col">
            <Button
              variant={here ? "secondary" : "default"}
              onClick={() => {
                if (here) {
                  undoCheckIn(m.id);
                  toast(fmt(d.checkin.undone, { name: L(m.name) }));
                } else if (m.expiresInDays < 0) {
                  setConfirming(true);
                } else {
                  doCheckIn();
                }
              }}
            >
              <CheckCheck />
              {here ? d.checkin.checkedIn : d.profile.checkIn}
            </Button>
            {can("belts") && (
              <Link href="/demo/belts" className={buttonVariants({ variant: eligible ? "default" : "outline" })}>
                <Award />
                {d.profile.promote}
              </Link>
            )}
            {can("parent") && (
              <Button variant="outline" onClick={() => setNoting(true)}>
                <MessageCircle />
                {d.profile.message}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini icon={CalendarCheck} label={d.profile.attendance} value={m.attendance > 0 ? `${m.attendance}%` : "—"} />
        <Mini icon={CheckCheck} label={d.profile.sessions} value={m.attendance > 0 ? String(sessions) : "—"} />
        <Mini
          icon={Wallet}
          label={d.profile.subscription}
          value={fmt(m.expiresInDays < 0 ? d.profile.expiredWhen : d.profile.renews, {
            when: relDays(m.expiresInDays, lang),
          })}
          sub={`${d.plan[m.plan]} · ${money(PLAN_PRICE[m.plan], lang)}`}
          warn={m.expiresInDays <= 7}
        />
        <Mini
          icon={MedalIcon}
          label={d.profile.medals}
          value={can("competitions") ? String(medals.filter((r) => r.medal !== "participation").length) : "—"}
        />
      </div>

      <Tabs defaultValue={can("belts") ? "belts" : "attendance"}>
        <TabsList className="grid h-auto! w-full grid-cols-2 gap-1 sm:inline-flex sm:h-8! sm:w-fit">
          <TabsTrigger value="belts" className="px-3 py-1.5">{d.profile.tabBelts}</TabsTrigger>
          <TabsTrigger value="attendance" className="px-3 py-1.5">{d.profile.tabAttendance}</TabsTrigger>
          <TabsTrigger value="payments" className="px-3 py-1.5">{d.profile.tabPayments}</TabsTrigger>
          <TabsTrigger value="competitions" className="px-3 py-1.5">{d.profile.tabCompetitions}</TabsTrigger>
        </TabsList>

        <TabsContent value="belts">
          {!can("belts") ? (
            <InlineLock feature="belts" />
          ) : (
            <Card>
              <CardContent>
                <ol className="space-y-5">
                  {m.beltHistory.map((h) => (
                    <li key={h.belt} className="flex items-center gap-4">
                      <BeltGraphic belt={h.belt} className="h-10 w-[100px]" />
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {fmt(d.belts.promotedTo, { belt: L(BELTS[h.belt].name) })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(now, h.daysAgo, lang)} · {fmt(d.profile.awardedBy, { coach: L(COACHES[h.coachId].name) })}
                          {h.score ? ` · ${fmt(d.profile.score, { n: h.score })}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-center gap-4">
                    <BeltGraphic belt={0} className="h-10 w-[100px]" />
                    <div>
                      <p className="font-semibold">{d.profile.joinedClub}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(now, m.joinedDaysAgo, lang)}</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>
                {d.profile.last12}
                {m.attendance > 0 && <> · {fmt(d.profile.rate, { n: m.attendance })}</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 && <p className="py-6 text-center text-muted-foreground">{d.profile.noSessions}</p>}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border p-3 text-center",
                      h.present
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{formatWeekday(now, h.daysAgo, lang)}</p>
                    <p className="text-sm font-semibold">{formatDay(now, h.daysAgo, lang)}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs font-medium",
                        h.present ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                      )}
                    >
                      {h.present ? (m.gender === "f" ? d.profile.presentF : d.profile.present) : m.gender === "f" ? d.profile.absentF : d.profile.absent}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-11 ps-4">{d.profile.date}</TableHead>
                  <TableHead>{d.profile.amount}</TableHead>
                  <TableHead>{d.profile.methodCol}</TableHead>
                  <TableHead className="pe-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.payments.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-3 ps-4">{formatDate(now, p.daysAgo, lang)}</TableCell>
                    <TableCell className="font-medium">
                      <Money n={p.amount} />
                    </TableCell>
                    <TableCell>{d.method[p.method]}</TableCell>
                    <TableCell className="pe-4">
                      <StatusBadge status="paid" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="competitions">
          {!can("competitions") ? (
            <InlineLock feature="competitions" />
          ) : medals.length === 0 ? (
            <Card className="py-10 text-center text-muted-foreground">{d.profile.noCompetitions}</Card>
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-11 ps-4">{d.profile.event}</TableHead>
                    <TableHead>{d.profile.date}</TableHead>
                    <TableHead>{d.profile.categoryCol}</TableHead>
                    <TableHead className="pe-4">{d.profile.result}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medals.map((r) => {
                    const ev = EVENTS.find((e) => e.id === r.eventId)!;
                    return (
                      <TableRow key={r.eventId}>
                        <TableCell className="py-3 ps-4 font-medium">{L(ev.name)}</TableCell>
                        <TableCell>{formatDate(now, -ev.inDays, lang)}</TableCell>
                        <TableCell>{d.category[r.category]}</TableCell>
                        <TableCell className="pe-4">
                          <MedalChip medal={r.medal} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <NoteDialog member={noting ? m : null} onClose={() => setNoting(false)} />
      <ExpiredCheckInDialog
        member={confirming ? m : null}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          doCheckIn();
        }}
      />
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  sub,
  warn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            warn ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-tight text-muted-foreground">{label}</p>
          <p className="text-lg leading-tight font-bold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
