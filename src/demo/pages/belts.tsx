"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Check, CheckCheck, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BELTS, COACHES, CLASSES, type Member } from "../data";
import { formatDate, years } from "../format";
import { fmt } from "../i18n";
import { isEligible, monthsAtBelt } from "../logic";
import type { WaMessage } from "../messages";
import { useDemo } from "../state";
import { BeltGraphic } from "../components/belt";
import { MemberAvatar, NativeSelect, PageHeader } from "../components/bits";
import { MessageBubble } from "../components/phone";
import { useRetained } from "../use-retained";

type Done = { member: Member; belt: number; parentName: string; note: string; h: number; m: number };

export function BeltsPage() {
  const { d, L, lang, dir, now, members } = useDemo();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [target, setTarget] = useState<Member | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const ready = members
    .filter(isEligible)
    .sort((a, b) => (a.id === "m1" ? -1 : b.id === "m1" ? 1 : b.attendance - a.attendance));

  const recent = members
    .flatMap((m) => m.beltHistory.slice(0, 1).map((h) => ({ m, h })))
    .sort((a, b) => a.h.daysAgo - b.h.daysAgo)
    .slice(0, 6);

  return (
    <div>
      <PageHeader title={d.belts.title} subtitle={d.belts.subtitle} />

      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <Award className="size-5 text-primary" />
        {d.belts.ready}
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm text-primary tabular-nums">{ready.length}</span>
      </h2>

      {ready.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">{d.belts.nobody}</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ready.map((m) => (
            <Card key={m.id} className={m.id === "m1" ? "ring-2 ring-primary/40" : undefined}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MemberAvatar id={m.id} name={m.name} size="lg" />
                  <div className="min-w-0">
                    <p className="leading-snug font-semibold break-words">{L(m.name)}</p>
                    <p className="text-xs text-muted-foreground">
                      {years(m.age, lang)} · {L(CLASSES.find((c) => c.id === m.classId)!.name)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/60 py-3">
                  <BeltGraphic belt={m.belt} className="h-9 w-[84px]" />
                  <Arrow className="size-5 text-muted-foreground" />
                  <BeltGraphic belt={m.belt + 1} className="h-9 w-[84px]" />
                </div>

                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-500" />
                    {fmt(d.belts.criteriaTime, { n: monthsAtBelt(m) })}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 text-emerald-500" />
                    {fmt(d.belts.criteriaAttendance, { n: m.attendance })}
                  </li>
                </ul>

                <Button className="w-full" onClick={() => setTarget(m)}>
                  <Award />
                  {d.belts.promote}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{d.belts.recent}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.map(({ m, h }) => (
            <div key={m.id} className="flex items-center gap-3">
              <MemberAvatar id={m.id} name={m.name} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`/demo/members/${m.id}`} className="block text-sm font-medium hover:underline">
                  {L(m.name)}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {fmt(d.belts.promotedTo, { belt: L(BELTS[h.belt].name) })} · {fmt(d.belts.by, { coach: L(COACHES[h.coachId].name) })}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(now, h.daysAgo, lang)}</span>
              <BeltGraphic belt={h.belt} className="hidden h-6 w-[60px] sm:block" />
            </div>
          ))}
        </CardContent>
      </Card>

      <PromoteDialog
        member={target}
        onClose={() => setTarget(null)}
        onDone={(x) => {
          setTarget(null);
          setDone(x);
        }}
      />
      <SuccessDialog done={done} onClose={() => setDone(null)} />
    </div>
  );
}

function PromoteDialog({
  member: memberProp,
  onClose,
  onDone,
}: {
  member: Member | null;
  onClose: () => void;
  onDone: (d: Done) => void;
}) {
  const { d, L, can, promote, parentById, nextClock } = useDemo();
  const member = useRetained(memberProp);
  const [score, setScore] = useState(92);
  const [coachId, setCoachId] = useState("karim");
  const [note, setNote] = useState("");

  const next = member ? member.belt + 1 : 0;
  const parent = member ? parentById(member.parentId) : undefined;
  const notify = can("parent");

  const preview: WaMessage | null = member
    ? {
        id: "preview",
        parentId: member.parentId,
        memberId: member.id,
        kind: "promotion",
        day: "today",
        h: nextClock.h,
        m: nextClock.m,
        belt: next,
        note: note.trim() || undefined,
      }
    : null;

  function confirm() {
    if (!member) return;
    promote(member.id, { score, coachId, note });
    onDone({
      member: { ...member, belt: next },
      belt: next,
      parentName: parent ? L(parent.name) : "",
      note: note.trim(),
      h: nextClock.h,
      m: nextClock.m,
    });
    setNote("");
  }

  return (
    <Dialog open={!!memberProp} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        {member && preview && (
          <>
            <DialogHeader>
              <DialogTitle>{fmt(d.belts.dialogTitle, { name: L(member.name) })}</DialogTitle>
              <DialogDescription>{d.belts.dialogDesc}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-around rounded-xl bg-muted/60 py-3">
              <div className="text-center">
                <p className="mb-1 text-[11px] text-muted-foreground">{d.belts.from}</p>
                <BeltGraphic belt={member.belt} className="h-9 w-[84px]" />
                <p className="text-xs font-medium">{L(BELTS[member.belt].name)}</p>
              </div>
              <Sparkles className="size-5 text-amber-500" />
              <div className="text-center">
                <p className="mb-1 text-[11px] text-muted-foreground">{d.belts.to}</p>
                <BeltGraphic belt={next} className="h-9 w-[84px]" />
                <p className="text-xs font-bold">{L(BELTS[next].name)}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="score">{d.belts.score}</Label>
                  <span className="text-sm font-semibold tabular-nums">{score}%</span>
                </div>
                <input
                  id="score"
                  type="range"
                  min={60}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="accent-primary"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{d.belts.coach}</Label>
                <NativeSelect value={coachId} onChange={setCoachId}>
                  {Object.values(COACHES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {L(c.name)}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              {notify && (
                <div className="grid gap-1.5">
                  <Label htmlFor="note">{d.belts.note}</Label>
                  <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={d.belts.notePh} />
                </div>
              )}
            </div>

            {notify && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">{d.belts.preview}</p>
                <div className="rounded-xl bg-[#efeae2] p-3 dark:bg-[#0b141a]">
                  <MessageBubble msg={preview} member={member} />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {d.common.cancel}
              </Button>
              <Button onClick={confirm}>
                <Award />
                {notify ? d.belts.confirm : d.belts.confirmBasic}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessDialog({ done: doneProp, onClose }: { done: Done | null; onClose: () => void }) {
  const { d, L, can } = useDemo();
  const done = useRetained(doneProp);
  const notify = can("parent");
  const msg: WaMessage | null = done
    ? {
        id: "sent",
        parentId: done.member.parentId,
        memberId: done.member.id,
        kind: "promotion",
        day: "today",
        h: done.h,
        m: done.m,
        belt: done.belt,
        note: done.note || undefined,
      }
    : null;

  return (
    <Dialog open={!!doneProp} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {done && msg && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="demo-bounce-in">
              <BeltGraphic belt={done.belt} className="h-16 w-[160px]" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {fmt(d.belts.successTitle, { name: L(done.member.name), belt: L(BELTS[done.belt].name) })}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {notify ? fmt(d.belts.successSub, { parent: done.parentName }) : d.belts.successSubBasic}
              </DialogDescription>
            </div>
            {notify && (
              <div className="demo-pop w-full rounded-xl bg-[#efeae2] p-3 text-start dark:bg-[#0b141a]">
                <MessageBubble msg={msg} member={done.member} ticks />
              </div>
            )}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              {notify && (
                <Link href="/demo/parent" className={buttonVariants()}>
                  <CheckCheck />
                  {d.belts.seePhone}
                </Link>
              )}
              <Button variant="outline" onClick={onClose}>
                {d.belts.done}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
