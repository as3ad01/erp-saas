"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  BELTS,
  CLASSES,
  INITIAL_MEMBERS,
  PARENTS,
  PLAN_DAYS,
  PLAN_PRICE,
  REVENUE_SERIES,
  initialPresent,
  type Bi,
  type Lang,
  type Member,
  type Parent,
  type Plan,
  type Tier,
} from "./data";
import { dictionaries, type Dict } from "./i18n";
import { tierAllows, type Feature } from "./logic";
import type { WaKind, WaMessage } from "./messages";

type State = {
  members: Member[];
  parents: Parent[];
  present: Record<string, string[]>;
  reminded: string[];
  messages: WaMessage[];
  extraRevenue: number;
  seq: number;
};

const SEED_MESSAGES: WaMessage[] = [
  { id: "s1", parentId: "p1", memberId: "m1", kind: "welcome", day: "yesterday", h: 9, m: 12 },
  { id: "s2", parentId: "p1", memberId: "m2", kind: "arrival", day: "yesterday", h: 16, m: 2, classId: "beg" },
  { id: "s3", parentId: "p1", memberId: "m2", kind: "arrival", day: "today", h: 16, m: 4, classId: "beg" },
];

function initialState(): State {
  return {
    members: INITIAL_MEMBERS,
    parents: PARENTS,
    present: initialPresent(),
    reminded: [],
    messages: SEED_MESSAGES,
    extraRevenue: 0,
    seq: 0,
  };
}

type Clock = { h: number; m: number };

type Action =
  | { type: "reset" }
  | { type: "checkin"; memberId: string; clock: Clock; notify: boolean }
  | { type: "undo"; memberId: string }
  | {
      type: "promote";
      memberId: string;
      score: number;
      coachId: string;
      note: string;
      clock: Clock;
      notify: boolean;
    }
  | { type: "remind"; memberIds: string[]; clock: Clock; notify: boolean }
  | { type: "pay"; memberId: string; clock: Clock; notify: boolean }
  | { type: "add"; member: Member; parent: Parent; clock: Clock; notify: boolean };

function push(
  state: State,
  member: Member,
  kind: WaKind,
  clock: Clock,
  extra: Partial<WaMessage> = {}
): Pick<State, "messages" | "seq"> {
  const msg: WaMessage = {
    id: `l${state.seq + 1}`,
    parentId: member.parentId,
    memberId: member.id,
    kind,
    day: "today",
    h: clock.h,
    m: clock.m,
    live: true,
    ...extra,
  };
  return { messages: [...state.messages, msg], seq: state.seq + 1 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initialState();

    case "checkin": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m) return state;
      const list = state.present[m.classId] ?? [];
      if (list.includes(m.id)) return state;
      const next = { ...state, present: { ...state.present, [m.classId]: [...list, m.id] } };
      if (!action.notify) return next;
      return { ...next, ...push(next, m, "arrival", action.clock, { classId: m.classId }) };
    }

    case "undo": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m) return state;
      return {
        ...state,
        present: {
          ...state.present,
          [m.classId]: (state.present[m.classId] ?? []).filter((id) => id !== m.id),
        },
      };
    }

    case "promote": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m || m.belt >= BELTS.length - 1) return state;
      const belt = m.belt + 1;
      const updated: Member = {
        ...m,
        belt,
        beltHistory: [
          { belt, daysAgo: 0, score: action.score, coachId: action.coachId },
          ...m.beltHistory,
        ],
      };
      const next = {
        ...state,
        members: state.members.map((x) => (x.id === m.id ? updated : x)),
      };
      if (!action.notify) return next;
      return {
        ...next,
        ...push(next, updated, "promotion", action.clock, {
          belt,
          note: action.note.trim() || undefined,
        }),
      };
    }

    case "remind": {
      let next: State = { ...state, reminded: [...new Set([...state.reminded, ...action.memberIds])] };
      if (action.notify) {
        for (const id of action.memberIds) {
          const m = next.members.find((x) => x.id === id);
          if (!m) continue;
          next = {
            ...next,
            ...push(next, m, "reminder", action.clock, {
              amount: PLAN_PRICE[m.plan],
              days: m.expiresInDays,
            }),
          };
        }
      }
      return next;
    }

    case "pay": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m) return state;
      const amount = PLAN_PRICE[m.plan];
      const updated: Member = {
        ...m,
        expiresInDays: Math.max(m.expiresInDays, 0) + PLAN_DAYS[m.plan],
        payments: [{ amount, daysAgo: 0, method: "card" }, ...m.payments],
      };
      const next: State = {
        ...state,
        members: state.members.map((x) => (x.id === m.id ? updated : x)),
        reminded: state.reminded.filter((id) => id !== m.id),
        extraRevenue: state.extraRevenue + amount,
      };
      if (!action.notify) return next;
      return { ...next, ...push(next, updated, "receipt", action.clock, { amount }) };
    }

    case "add": {
      const next: State = {
        ...state,
        members: [action.member, ...state.members],
        parents: state.parents.some((p) => p.id === action.parent.id)
          ? state.parents
          : [...state.parents, action.parent],
        extraRevenue: state.extraRevenue + PLAN_PRICE[action.member.plan],
      };
      if (!action.notify) return next;
      return { ...next, ...push(next, action.member, "welcome", action.clock) };
    }
  }
}

function clockNow(): Clock {
  const d = new Date();
  return { h: d.getHours(), m: d.getMinutes() };
}

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  d: Dict;
  setLang: (l: Lang) => void;
  L: (b: Bi) => string;
  pkg: Tier;
  setPkg: (t: Tier) => void;
  can: (f: Feature) => boolean;
  now: Date;

  members: Member[];
  parents: Parent[];
  memberById: (id: string) => Member | undefined;
  parentById: (id: string) => Parent | undefined;
  present: Record<string, string[]>;
  presentTotal: number;
  reminded: string[];
  messages: WaMessage[];
  revenueThisMonth: number;

  checkIn: (memberId: string) => void;
  undoCheckIn: (memberId: string) => void;
  promote: (memberId: string, o: { score: number; coachId: string; note: string }) => void;
  remind: (memberIds: string[]) => void;
  pay: (memberId: string) => void;
  addMember: (o: {
    name: string;
    age: number;
    parentName: string;
    phone: string;
    plan: Plan;
  }) => Member;
  reset: () => void;
};

const DemoContext = createContext<Ctx | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>");
  return ctx;
}

function writeCookie(name: string, value: string) {
  try {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
  } catch {
    // cookies blocked: the demo still works, it just won't remember the choice.
  }
}

export function DemoProvider({
  initialLang,
  initialPkg,
  nowIso,
  children,
}: {
  initialLang: Lang;
  initialPkg: Tier;
  nowIso: string;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [pkg, setPkgState] = useState<Tier>(initialPkg);
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const now = useMemo(() => new Date(nowIso), [nowIso]);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeCookie("locale", l);
  }, []);
  const setPkg = useCallback((t: Tier) => {
    setPkgState(t);
    writeCookie("demo_pkg", t);
  }, []);

  const can = useCallback((f: Feature) => tierAllows(pkg, f), [pkg]);
  const notify = tierAllows(pkg, "parent");

  const L = useCallback((b: Bi) => b[lang], [lang]);

  const value = useMemo<Ctx>(() => {
    const presentTotal = CLASSES.reduce((n, c) => n + (state.present[c.id]?.length ?? 0), 0);
    return {
      lang,
      dir,
      d: dictionaries[lang],
      setLang,
      L,
      pkg,
      setPkg,
      can,
      now,
      members: state.members,
      parents: state.parents,
      memberById: (id) => state.members.find((m) => m.id === id),
      parentById: (id) => state.parents.find((p) => p.id === id),
      present: state.present,
      presentTotal,
      reminded: state.reminded,
      messages: state.messages,
      revenueThisMonth: REVENUE_SERIES[REVENUE_SERIES.length - 1] + state.extraRevenue,
      checkIn: (memberId) => dispatch({ type: "checkin", memberId, clock: clockNow(), notify }),
      undoCheckIn: (memberId) => dispatch({ type: "undo", memberId }),
      promote: (memberId, o) =>
        dispatch({ type: "promote", memberId, ...o, clock: clockNow(), notify }),
      remind: (memberIds) => dispatch({ type: "remind", memberIds, clock: clockNow(), notify }),
      pay: (memberId) => dispatch({ type: "pay", memberId, clock: clockNow(), notify }),
      addMember: (o) => {
        const idx = state.members.length + 1;
        const parentId = `pn${idx}`;
        const classId = o.age <= 8 ? "beg" : o.age <= 12 ? "adv" : o.age <= 16 ? "teen" : "adult";
        const member: Member = {
          id: `mn${idx}`,
          name: { ar: o.name, en: o.name },
          gender: "m",
          age: o.age,
          classId,
          branchId: "main",
          parentId,
          belt: 0,
          beltHistory: [],
          plan: o.plan,
          expiresInDays: PLAN_DAYS[o.plan],
          joinedDaysAgo: 0,
          attendance: 100,
          payments: [{ amount: PLAN_PRICE[o.plan], daysAgo: 0, method: "cash" }],
        };
        const parent: Parent = {
          id: parentId,
          name: { ar: o.parentName, en: o.parentName },
          phone: o.phone,
        };
        dispatch({ type: "add", member, parent, clock: clockNow(), notify });
        return member;
      },
      reset: () => dispatch({ type: "reset" }),
    };
  }, [lang, dir, setLang, L, pkg, setPkg, can, now, state, notify]);

  return (
    <DemoContext.Provider value={value}>
      {children}
      <Toaster dir={dir} position={dir === "rtl" ? "top-left" : "top-right"} />
    </DemoContext.Provider>
  );
}
