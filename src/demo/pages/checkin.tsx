"use client";

import { useState } from "react";
import { Check, Search, TriangleAlert, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CLASSES, type Member } from "../data";
import { formatTime } from "../format";
import { fmt } from "../i18n";
import { useDemo } from "../state";
import { BeltChip } from "../components/belt";
import { MemberAvatar, PageHeader, ProgressBar } from "../components/bits";
import { ExpiredCheckInDialog } from "../components/expired-dialog";

export function CheckInPage() {
  const { d, L, lang, members, present, checkIn, undoCheckIn, can } = useDemo();
  const [classId, setClassId] = useState("adv");
  const [q, setQ] = useState("");

  const [confirming, setConfirming] = useState<Member | null>(null);

  function doCheckIn(m: Member) {
    checkIn(m.id);
    toast.success(fmt(can("parent") ? d.checkin.toastWa : d.checkin.toast, { name: L(m.name) }));
  }

  // An expired subscription needs the coach's confirmation first.
  function requestCheckIn(m: Member) {
    if (m.expiresInDays < 0) setConfirming(m);
    else doCheckIn(m);
  }

  const cls = CLASSES.find((c) => c.id === classId)!;
  const roster = members.filter((m) => m.classId === classId);
  const here = present[classId] ?? [];
  const needle = q.trim().toLowerCase();
  const shown = roster.filter(
    (m) => !needle || m.name.en.toLowerCase().includes(needle) || m.name.ar.includes(needle)
  );

  return (
    <div>
      <PageHeader
        title={d.checkin.title}
        subtitle={can("parent") ? d.checkin.subtitle : d.checkin.subtitleBasic}
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CLASSES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClassId(c.id)}
            className={cn(
              "rounded-xl border p-3 text-start transition-colors",
              c.id === classId ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "bg-card hover:bg-muted/50"
            )}
          >
            <p className="font-semibold">{L(c.name)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(c.startH, c.startM, lang)} · {d.status[c.status]}
            </p>
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-4 px-4">
          <div className="min-w-48 flex-1">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium">{L(cls.name)}</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {fmt(d.checkin.count, { a: here.length, b: roster.length })}
              </span>
            </div>
            <ProgressBar value={roster.length ? (here.length / roster.length) * 100 : 0} className="h-3" />
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={d.checkin.searchPh}
              className="h-10 ps-9"
            />
          </div>
        </div>
      </Card>

      {cls.status === "upcoming" && (
        <p className="mb-3 text-sm text-muted-foreground">{d.checkin.notStarted}</p>
      )}

      {shown.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">{d.checkin.empty}</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((m) => {
            const isHere = here.includes(m.id);
            const expired = m.expiresInDays < 0;
            return (
              <div
                key={m.id}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl border p-4 transition-all",
                  isHere
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "bg-card hover:border-primary/50 hover:shadow-sm active:scale-[0.99]"
                )}
              >
                {!isHere && (
                  <button
                    type="button"
                    aria-label={`${L(m.name)}: ${d.checkin.tap}`}
                    onClick={() => requestCheckIn(m)}
                    className="absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                )}
                <MemberAvatar id={m.id} name={m.name} size="lg" />
                <div className="min-w-0 flex-1">
                  {/* Names never truncate: a coach has to tell Nour Farouk from Nour Hamdan. */}
                  <p className="leading-snug font-semibold break-words">{L(m.name)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {can("belts") && <BeltChip belt={m.belt} />}
                    {expired && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                        <TriangleAlert className="size-3" />
                        {d.checkin.expiredWarn}
                      </span>
                    )}
                  </div>
                </div>
                {isHere ? (
                  <div className="relative z-10 flex shrink-0 flex-col items-center gap-0.5">
                    <span className="demo-bounce-in flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-5" />
                    </span>
                    <button
                      type="button"
                      onClick={() => undoCheckIn(m.id)}
                      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    >
                      <Undo2 className="size-3.5" />
                      {d.checkin.undo}
                    </button>
                  </div>
                ) : (
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/70"
                  >
                    <Check className="size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ExpiredCheckInDialog
        member={confirming}
        onCancel={() => setConfirming(null)}
        onConfirm={(m) => {
          setConfirming(null);
          doCheckIn(m);
        }}
      />
    </div>
  );
}
