"use client";

import { Calendar, MapPin, Medal as MedalIcon, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLASSES, CLUB, COACHES, COMP_RESULTS, EVENTS, MEDAL_COLOR, type Medal } from "../data";
import { formatDate, formatTime, relDays } from "../format";
import { useDemo } from "../state";
import { BeltChip } from "./belt";
import { MemberAvatar } from "./bits";
import { Logo } from "./logo";

const STRINGS = {
  en: { weekdays: "Sat – Thu" },
  ar: { weekdays: "السبت – الخميس" },
};

/** The public website a club would get with the Pro package. */
export function ChampionsSite({ embedded }: { embedded?: boolean }) {
  const { d, L, lang, now, members } = useDemo();
  const s = d.site;

  const champs = members
    .map((m) => {
      const mine = COMP_RESULTS.filter((r) => r.memberId === m.id);
      const count = (x: Medal) => mine.filter((r) => r.medal === x).length;
      return {
        m,
        gold: count("gold"),
        silver: count("silver"),
        bronze: count("bronze"),
        score: count("gold") * 3 + count("silver") * 2 + count("bronze"),
      };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const totalMedals = COMP_RESULTS.filter((r) => r.medal !== "participation").length;
  const upcoming = EVENTS.filter((e) => e.inDays > 0);

  return (
    <div className="bg-background text-foreground">
      {/* nav */}
      <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Logo className="size-8" />
          <span className="text-sm font-bold">{L(CLUB.name)}</span>
        </div>
        <nav className={cn("hidden gap-5 text-sm text-muted-foreground", embedded ? "md:flex" : "sm:flex")}>
          {Object.values(s.nav).map((x) => (
            <span key={x}>{x}</span>
          ))}
        </nav>
      </div>

      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-red-950 to-red-800 px-6 py-16 text-center text-white">
        <div className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-amber-400/20 blur-3xl" />
        <p className="mb-3 text-sm tracking-widest text-amber-300 uppercase">🥋 {L(CLUB.name)}</p>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{s.heroTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">{s.heroSub}</p>
        <Button
          size="lg"
          onClick={() => toast.success(s.bookToast)}
          className="mt-8 h-11 bg-amber-400 px-6 text-base font-bold text-zinc-950 hover:bg-amber-300"
        >
          {s.cta}
        </Button>
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 gap-4 border-b px-6 py-8 text-center sm:grid-cols-4">
        {[
          { v: members.length, l: s.stats.students },
          { v: totalMedals, l: s.stats.medals },
          { v: Object.keys(COACHES).length, l: s.stats.coaches },
          { v: 8, l: s.stats.years },
        ].map((x) => (
          <div key={x.l}>
            <p className="text-3xl font-extrabold text-primary tabular-nums">{x.v}</p>
            <p className="text-sm text-muted-foreground">{x.l}</p>
          </div>
        ))}
      </section>

      {/* champions */}
      <section className="px-6 py-10">
        <h3 className="text-2xl font-bold">{s.champions}</h3>
        <p className="mb-6 text-sm text-muted-foreground">{s.championsSub}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {champs.map(({ m, gold, silver, bronze }) => (
            <div key={m.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <MemberAvatar id={m.id} name={m.name} size="lg" />
                <div className="min-w-0">
                  <p className="leading-snug font-semibold">{L(m.name)}</p>
                  <BeltChip belt={m.belt} className="mt-1" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                {(
                  [
                    ["gold", gold],
                    ["silver", silver],
                    ["bronze", bronze],
                  ] as [Medal, number][]
                ).map(([k, n]) => (
                  <span key={k} className="flex items-center gap-1 font-semibold tabular-nums">
                    <MedalIcon className="size-4" style={{ color: MEDAL_COLOR[k] }} />
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* classes + events */}
      <section className="grid gap-8 bg-muted/40 px-6 py-10 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-bold">{s.classes}</h3>
          <div className="space-y-2">
            {CLASSES.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div>
                  <p className="font-semibold">{L(c.name)}</p>
                  <p className="text-xs text-muted-foreground">{STRINGS[lang].weekdays}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatTime(c.startH, c.startM, lang)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-bold">{s.events}</h3>
          <div className="space-y-2">
            {upcoming.map((e) => (
              <div key={e.id} className="rounded-xl border bg-card px-4 py-3">
                <p className="font-semibold">{L(e.name)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {formatDate(now, -e.inDays, lang)} · {relDays(e.inDays, lang)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {L(e.place)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-5 text-xs text-muted-foreground">
        <span>
          © {L(CLUB.name)}. {s.footer}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5" />
          <span dir="ltr">+962 79 500 0100</span>
        </span>
      </footer>
    </div>
  );
}
