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
import { DirectionProvider } from "@base-ui/react/direction-provider";
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
import { demoClock, type WaKind, type WaMessage } from "./messages";

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

type Action =
  | { type: "reset" }
  | { type: "checkin"; memberId: string; notify: boolean }
  | { type: "undo"; memberId: string }
  | {
      type: "promote";
      memberId: string;
      score: number;
      coachId: string;
      note: string;
      notify: boolean;
    }
  | { type: "note"; memberId: string; text: string }
  | { type: "remind"; memberIds: string[]; notify: boolean }
  | { type: "pay"; memberId: string; notify: boolean }
  | { type: "add"; member: Member; parent: Parent; notify: boolean };

function push(
  state: State,
  member: Member,
  kind: WaKind,
  extra: Partial<WaMessage> = {}
): Pick<State, "messages" | "seq"> {
  const clock = demoClock(state.seq);
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
      return { ...next, ...push(next, m, "arrival", { classId: m.classId }) };
    }

    case "undo": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m) return state;
      // Withdraw the most recent live arrival message too, so checking in again
      // does not leave the parent with two "arrived" messages.
      const at = state.messages.map((x) => x.live && x.kind === "arrival" && x.memberId === m.id).lastIndexOf(true);
      return {
        ...state,
        present: {
          ...state.present,
          [m.classId]: (state.present[m.classId] ?? []).filter((id) => id !== m.id),
        },
        messages: at === -1 ? state.messages : state.messages.filter((_, i) => i !== at),
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
        ...push(next, updated, "promotion", {
          belt,
          note: action.note.trim() || undefined,
        }),
      };
    }

    case "note": {
      const m = state.members.find((x) => x.id === action.memberId);
      if (!m) return state;
      return { ...state, ...push(state, m, "note", { text: action.text }) };
    }

    case "remind": {
      let next: State = { ...state, reminded: [...new Set([...state.reminded, ...action.memberIds])] };
      if (action.notify) {
        for (const id of action.memberIds) {
          const m = next.members.find((x) => x.id === id);
          if (!m) continue;
          next = {
            ...next,
            ...push(next, m, "reminder", {
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
      return { ...next, ...push(next, updated, "receipt", { amount }) };
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
      return { ...next, ...push(next, action.member, "welcome") };
    }
  }
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
  /** Time (h, m) the next live WhatsApp message will carry. */
  nextClock: { h: number; m: number };
  revenueThisMonth: number;
  /** Members added during this session (for the "new members" figure). */
  addedCount: number;

  checkIn: (memberId: string) => void;
  undoCheckIn: (memberId: string) => void;
  promote: (memberId: string, o: { score: number; coachId: string; note: string }) => void;
  remind: (memberIds: string[]) => void;
  pay: (memberId: string) => void;
  sendNote: (memberId: string, text: string) => void;
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
      nextClock: demoClock(state.seq),
      addedCount: state.members.filter((m) => m.id.startsWith("mn")).length,
      revenueThisMonth: REVENUE_SERIES[REVENUE_SERIES.length - 1] + state.extraRevenue,
      checkIn: (memberId) => dispatch({ type: "checkin", memberId, notify }),
      undoCheckIn: (memberId) => dispatch({ type: "undo", memberId }),
      promote: (memberId, o) =>
        dispatch({ type: "promote", memberId, ...o, notify }),
      remind: (memberIds) => dispatch({ type: "remind", memberIds, notify }),
      pay: (memberId) => dispatch({ type: "pay", memberId, notify }),
      sendNote: (memberId, text) => dispatch({ type: "note", memberId, text }),
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
          attendance: 0,
          payments: [{ amount: PLAN_PRICE[o.plan], daysAgo: 0, method: "cash" }],
        };
        const parent: Parent = {
          id: parentId,
          name: { ar: o.parentName, en: o.parentName },
          phone: o.phone,
        };
        dispatch({ type: "add", member, parent, notify });
        return member;
      },
      reset: () => dispatch({ type: "reset" }),
    };
  }, [lang, dir, setLang, L, pkg, setPkg, can, now, state, notify]);

  return (
    <DemoContext.Provider value={value}>
      <DirectionProvider direction={dir}>
        {children}
        <Toaster dir={dir} position={dir === "rtl" ? "top-left" : "top-right"} />
      </DirectionProvider>
    </DemoContext.Provider>
  );
}
