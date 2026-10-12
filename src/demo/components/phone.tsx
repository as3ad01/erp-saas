"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BatteryFull,
  CalendarCheck,
  CheckCheck,
  Clock,
  CreditCard,
  Home,
  MessageCircle,
  MoreVertical,
  Phone,
  Signal,
  Video,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BELTS,
  CLASSES,
  CLUB,
  COACHES,
  type Member,
  PLAN_PRICE,
  attendanceHistory,
} from "../data";
import { formatDay, formatTime, formatWeekday, formatDate, relDays } from "../format";
import { fmt } from "../i18n";
import { beltProgress, isEligible } from "../logic";
import { messageLines, type WaMessage } from "../messages";
import { useDemo } from "../state";
import { BeltGraphic } from "./belt";
import { Money, ProgressBar } from "./bits";
import { Logo } from "./logo";

// ------------------------------------------------------------ phone frame

export function PhoneFrame({
  children,
  banner,
  className,
}: {
  children: React.ReactNode;
  banner?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto h-[620px] w-[300px] shrink-0 rounded-[46px] bg-zinc-900 p-[9px] shadow-2xl ring-1 ring-black/40",
        className
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[38px] bg-background">
        {/* status bar */}
        <div dir="ltr" className="relative z-20 flex h-9 shrink-0 items-center justify-between px-6 text-[11px] font-semibold">
          <span>9:41</span>
          <div className="absolute start-1/2 top-2 h-[18px] w-20 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Signal className="size-3" />
            <Wifi className="size-3" />
            <BatteryFull className="size-3.5" />
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <div className="absolute inset-x-0 bottom-1.5 z-20 mx-auto h-1 w-24 rounded-full bg-foreground/30" />
        {banner}
      </div>
    </div>
  );
}

/** iOS-style push notification that slides in once, driven purely by CSS. */
export function PushBanner({ msg }: { msg: WaMessage }) {
  const { lang, memberById, L } = useDemo();
  const member = memberById(msg.memberId);
  if (!member) return null;
  const text = messageLines(msg, member, lang)[0];
  return (
    <div
      key={msg.id}
      className="demo-banner pointer-events-none absolute inset-x-2 top-9 z-30 flex items-start gap-2.5 rounded-2xl border bg-popover/95 p-2.5 shadow-xl backdrop-blur"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#25d366] text-white">
        <MessageCircle className="size-4.5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-semibold">{L(CLUB.name)}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground">{lang === "ar" ? "الآن" : "now"}</span>
        </div>
        <p className="line-clamp-2 text-[11px] leading-snug">{text}</p>
      </div>
    </div>
  );
}

export function LatestBanner({ parentId }: { parentId: string }) {
  const { messages } = useDemo();
  const latest = [...messages].reverse().find((m) => m.parentId === parentId && m.live);
  return latest ? <PushBanner msg={latest} /> : null;
}

// ------------------------------------------------------------ WhatsApp

export function WhatsAppChat({ parentId }: { parentId: string }) {
  const { messages, memberById, lang, L, dir } = useDemo();
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const scroller = useRef<HTMLDivElement>(null);
  const mine = messages.filter((m) => m.parentId === parentId);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [mine.length]);

  const days: ("yesterday" | "today")[] = ["yesterday", "today"];

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 bg-[#008069] px-2 py-2 text-white dark:bg-[#1f2c34]">
        <Back className="size-5 shrink-0" />
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          <Logo className="size-8" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold">
            {L(CLUB.name)}
            <BadgeCheck className="size-3.5 shrink-0 fill-[#25d366] text-white" />
          </p>
          <p className="text-[10px] opacity-80">{fmtBusiness(lang)}</p>
        </div>
        <Video className="size-4 shrink-0" />
        <Phone className="size-4 shrink-0" />
        <MoreVertical className="size-4 shrink-0" />
      </div>

      <div
        ref={scroller}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#efeae2] px-2.5 py-3 dark:bg-[#0b141a]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.035) 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.03) 1px, transparent 1.5px)",
          backgroundSize: "26px 26px, 34px 34px",
        }}
      >
        {days.map((day) => {
          const list = mine.filter((m) => m.day === day);
          if (list.length === 0) return null;
          return (
            <div key={day} className="space-y-1.5">
              <div className="flex justify-center">
                <span className="rounded-lg bg-white/90 px-2.5 py-0.5 text-[10px] text-zinc-500 shadow-sm dark:bg-[#182229] dark:text-zinc-400">
                  {day === "today" ? fmtDay(lang, "today") : fmtDay(lang, "yesterday")}
                </span>
              </div>
              {list.map((msg) => {
                const member = memberById(msg.memberId);
                if (!member) return null;
                return (
                  <div key={msg.id} className={cn("flex", msg.live && "demo-pop")}>
                    <MessageBubble msg={msg} member={member} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2 bg-[#f0f2f5] px-2 py-2 pb-4 dark:bg-[#1f2c34]">
        <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[12px] text-zinc-400 dark:bg-[#2a3942]">
          {lang === "ar" ? "اكتب رسالة" : "Message"}
        </div>
        <span className="flex size-8 items-center justify-center rounded-full bg-[#008069] text-white">
          <MessageCircle className="size-4" />
        </span>
      </div>
    </div>
  );
}

export function MessageBubble({
  msg,
  member,
  ticks,
}: {
  msg: WaMessage;
  member: Member;
  /** Outgoing-style double tick, used in previews. */
  ticks?: boolean;
}) {
  const { lang } = useDemo();
  const lines = messageLines(msg, member, lang);
  return (
    <div className="max-w-[88%] rounded-lg rounded-ss-none bg-white px-2 py-1.5 text-[13px] leading-snug text-zinc-900 shadow-sm dark:bg-[#202c33] dark:text-zinc-100">
      {msg.kind === "promotion" && (
        <div className="mb-1.5 flex flex-col items-center rounded-md bg-gradient-to-br from-red-600 to-amber-500 px-3 py-3 text-white">
          <BeltGraphic belt={msg.belt ?? 0} className="h-10 w-[100px]" />
          <p className="mt-1 text-xs font-bold">
            {fmt(lang === "ar" ? "الحزام {name}" : "{name} belt", {
              name: BELTS[msg.belt ?? 0].name[lang],
            })}
          </p>
        </div>
      )}
      {lines.map((l, i) => (
        <p key={i} className={cn("whitespace-pre-line", i === 0 && "font-medium")}>
          {l}
        </p>
      ))}
      <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
        {formatTime(msg.h, msg.m, lang)}
        {ticks && <CheckCheck className="size-3 text-sky-500" />}
      </p>
    </div>
  );
}

function fmtBusiness(lang: "ar" | "en") {
  return lang === "ar" ? "حساب تجاري" : "Business account";
}
function fmtDay(lang: "ar" | "en", day: "today" | "yesterday") {
  if (lang === "ar") return day === "today" ? "اليوم" : "أمس";
  return day === "today" ? "Today" : "Yesterday";
}

// ------------------------------------------------------------ parents' app

type Tab = "home" | "attendance" | "payments" | "messages";

export function ParentApp({
  parentId,
  withMessages,
}: {
  parentId: string;
  withMessages?: boolean;
}) {
  const { d, L, lang, now, members, parentById, pay, can } = useDemo();
  const parent = parentById(parentId);
  const kids = members.filter((m) => m.parentId === parentId);
  const [kidId, setKidId] = useState(kids[0]?.id);
  const [tab, setTab] = useState<Tab>("home");

  const kid = kids.find((k) => k.id === kidId) ?? kids[0];
  if (!parent || !kid) return null;

  const cls = CLASSES.find((c) => c.id === kid.classId)!;
  const next = kid.belt < BELTS.length - 1 ? kid.belt + 1 : null;
  const sessions = Math.round((kid.attendance / 100) * 12);
  const due = kid.expiresInDays <= 14;
  const amount = PLAN_PRICE[kid.plan];
  const ready = isEligible(kid);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "home", label: d.parent.tabHome, icon: Home },
    { id: "attendance", label: d.parent.tabAttendance, icon: CalendarCheck },
    { id: "payments", label: d.parent.tabPayments, icon: CreditCard },
  ];
  if (withMessages) tabs.push({ id: "messages", label: d.parent.tabMessages, icon: MessageCircle });

  function payNow() {
    pay(kid.id);
    toast.success(can("parent") ? d.parent.paidToast : d.parent.paidToastBasic);
  }

  const circ = 2 * Math.PI * 28;

  return (
    <div className="flex h-full flex-col bg-muted/40">
      {tab !== "messages" && (
        <div className="shrink-0 bg-gradient-to-b from-red-700 to-red-600 px-4 pt-1 pb-4 text-white">
          <div className="flex items-center gap-2">
            <Logo className="size-7" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] opacity-80">{L(CLUB.name)}</p>
              <p className="truncate text-sm font-bold">{fmt(d.parent.hello, { name: L(parent.name).split(" ")[0] })}</p>
            </div>
          </div>
          {kids.length > 1 && (
            <div className="mt-3 flex gap-2">
              {kids.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKidId(k.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    k.id === kid.id ? "bg-white text-red-700" : "bg-white/15 text-white"
                  )}
                >
                  {L(k.name).split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "home" && (
          <div className="space-y-3 p-3">
            {/* belt */}
            <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
              <p className="text-xs text-muted-foreground">{L(kid.name)}</p>
              <div className="my-2 flex justify-center">
                <BeltGraphic belt={kid.belt} className="demo-pop h-14 w-[140px]" key={kid.belt} />
              </div>
              <p className="text-base font-bold">{fmt(d.common.belt, { name: L(BELTS[kid.belt].name) })}</p>
              {next !== null ? (
                <div className="mt-3 text-start">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{fmt(d.parent.nextBelt, { belt: L(BELTS[next].name) })}</span>
                    <span className="tabular-nums">{ready ? "100%" : `${Math.min(95, beltProgress(kid))}%`}</span>
                  </div>
                  <ProgressBar value={ready ? 100 : Math.min(95, beltProgress(kid))} />
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-muted-foreground">{d.parent.maxBelt}</p>
              )}
            </div>

            {/* attendance + payment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border bg-card p-3 shadow-sm">
                <p className="mb-1 text-[11px] text-muted-foreground">{d.parent.attendance}</p>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 64 64" className="size-14 -rotate-90 rtl:rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-muted" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className="stroke-emerald-500"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - kid.attendance / 100)}
                    />
                  </svg>
                  <span className="text-lg font-bold tabular-nums">{kid.attendance}%</span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{fmt(d.parent.sessions, { a: sessions, b: 12 })}</p>
              </div>
              <div
                className={cn(
                  "rounded-2xl border p-3 shadow-sm",
                  due ? "border-amber-500/40 bg-amber-500/10" : "bg-card"
                )}
              >
                <p className="mb-1 text-[11px] text-muted-foreground">{d.parent.paymentDue}</p>
                {due ? (
                  <>
                    <p className="text-lg font-bold tabular-nums">
                      <Money n={amount} />
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      {fmt(d.parent.dueIn, { when: relDays(kid.expiresInDays, lang) })}
                    </p>
                    <Button size="xs" className="mt-2 w-full" onClick={payNow}>
                      {d.parent.payNow}
                    </Button>
                  </>
                ) : (
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{d.parent.paidThanks}</p>
                )}
              </div>
            </div>

            {/* next class */}
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{d.parent.nextClass}</p>
                <p className="truncate text-sm font-semibold">
                  {d.parent.tonight} · {formatTime(cls.startH, cls.startM, lang)}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {L(cls.name)} · {L(COACHES[cls.coachId].name)}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div className="space-y-2 p-3">
            <p className="text-xs font-semibold">{d.parent.recentClasses}</p>
            {attendanceHistory(kid, now).map((h, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 shadow-sm">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-white",
                    h.present ? "bg-emerald-500" : "bg-red-400"
                  )}
                >
                  <CheckCheck className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{L(cls.name)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatWeekday(now, h.daysAgo, lang)} · {formatDay(now, h.daysAgo, lang)}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {h.present ? d.profile.present : d.profile.absent}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-3 p-3">
            <div className={cn("rounded-2xl border p-3 shadow-sm", due ? "border-amber-500/40 bg-amber-500/10" : "bg-card")}>
              <p className="text-[11px] text-muted-foreground">{d.parent.paymentDue}</p>
              {due ? (
                <>
                  <p className="text-xl font-bold">
                    <Money n={amount} />
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {fmt(d.parent.dueIn, { when: relDays(kid.expiresInDays, lang) })}
                  </p>
                  <Button size="sm" className="mt-2 w-full" onClick={payNow}>
                    {d.parent.payNow}
                  </Button>
                </>
              ) : (
                <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">{d.parent.paidThanks}</p>
              )}
            </div>
            <p className="text-xs font-semibold">{d.parent.history}</p>
            {kid.payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2 shadow-sm">
                <div>
                  <p className="text-xs font-medium">{d.plan[kid.plan]}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(now, p.daysAgo, lang)} · {d.method[p.method]}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  <Money n={p.amount} />
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "messages" && <WhatsAppChat parentId={parentId} />}
      </div>

      <div className="flex shrink-0 border-t bg-card px-1 pt-1.5 pb-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition-colors",
                tab === t.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
