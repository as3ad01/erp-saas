// All demo data lives here, in code. Nothing in the demo touches a database.
// Everything is deterministic so server and client renders always agree.

export type Lang = "ar" | "en";
export type Bi = { ar: string; en: string };
export type Gender = "m" | "f";
export type Tier = "basic" | "standard" | "pro";
export type Plan = "monthly" | "quarterly" | "annual";
export type PayMethod = "cash" | "card" | "transfer";
export type Medal = "gold" | "silver" | "bronze" | "participation";

export const CLUB = {
  name: { ar: "أكاديمية التنين الذهبي", en: "Golden Dragon Academy" } as Bi,
  tagline: { ar: "هنا يُصنع الأبطال", en: "Where champions are made" } as Bi,
};

// ---------------------------------------------------------------- belts

export type Belt = { id: string; name: Bi; color: string; minMonths: number };

export const BELTS: Belt[] = [
  { id: "white", name: { ar: "الأبيض", en: "White" }, color: "#f5f5f4", minMonths: 3 },
  { id: "yellow", name: { ar: "الأصفر", en: "Yellow" }, color: "#facc15", minMonths: 3 },
  { id: "orange", name: { ar: "البرتقالي", en: "Orange" }, color: "#fb923c", minMonths: 3 },
  { id: "green", name: { ar: "الأخضر", en: "Green" }, color: "#22c55e", minMonths: 4 },
  { id: "blue", name: { ar: "الأزرق", en: "Blue" }, color: "#3b82f6", minMonths: 5 },
  { id: "brown", name: { ar: "البني", en: "Brown" }, color: "#8b5a2b", minMonths: 6 },
  { id: "black", name: { ar: "الأسود", en: "Black" }, color: "#1c1917", minMonths: 12 },
];

export const MIN_ATTENDANCE_FOR_PROMOTION = 75;

// ---------------------------------------------------------------- plans

// Jordanian dinars (JD). A kids' club in Amman charges roughly 25-40 JD a month.
export const PLAN_PRICE: Record<Plan, number> = { monthly: 30, quarterly: 80, annual: 300 };
export const PLAN_DAYS: Record<Plan, number> = { monthly: 30, quarterly: 90, annual: 365 };

// ---------------------------------------------------------------- people

export type Coach = { id: string; name: Bi };
export const COACHES: Record<string, Coach> = {
  karim: { id: "karim", name: { ar: "كابتن كريم", en: "Coach Karim" } },
  layla: { id: "layla", name: { ar: "كابتن ليلى", en: "Coach Layla" } },
  hassan: { id: "hassan", name: { ar: "كابتن حسن", en: "Coach Hassan" } },
};

export type Branch = { id: string; name: Bi; area: Bi };
export const BRANCHES: Branch[] = [
  { id: "main", name: { ar: "الفرع الرئيسي", en: "Main Branch" }, area: { ar: "وسط المدينة", en: "Downtown" } },
  { id: "north", name: { ar: "فرع التلال", en: "Hills Branch" }, area: { ar: "الشمال", en: "North" } },
  { id: "east", name: { ar: "فرع البوابة", en: "Gate Branch" }, area: { ar: "الشرق", en: "East" } },
];

export type ClassDef = {
  id: string;
  name: Bi;
  ages: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  coachId: string;
  // Fixed so the pitch looks the same whenever it is opened.
  status: "done" | "live" | "upcoming";
};

export const CLASSES: ClassDef[] = [
  { id: "beg", name: { ar: "الصغار المبتدئون", en: "Kids Beginners" }, ages: "5-8", startH: 16, startM: 0, endH: 17, endM: 0, coachId: "karim", status: "done" },
  { id: "adv", name: { ar: "الصغار المتقدمون", en: "Kids Advanced" }, ages: "9-12", startH: 17, startM: 15, endH: 18, endM: 15, coachId: "layla", status: "live" },
  { id: "teen", name: { ar: "الناشئون", en: "Teens" }, ages: "13-16", startH: 18, startM: 30, endH: 19, endM: 30, coachId: "karim", status: "upcoming" },
  { id: "adult", name: { ar: "الكبار", en: "Adults" }, ages: "17+", startH: 20, startM: 0, endH: 21, endM: 0, coachId: "hassan", status: "upcoming" },
];

export type Parent = { id: string; name: Bi; phone: string };

export type PaymentRec = { amount: number; daysAgo: number; method: PayMethod };
export type BeltRec = { belt: number; daysAgo: number; score?: number; coachId: string };

export type Member = {
  id: string;
  name: Bi;
  gender: Gender;
  age: number;
  classId: string;
  branchId: string;
  parentId: string;
  belt: number;
  beltHistory: BeltRec[];
  plan: Plan;
  /** Negative = already expired. */
  expiresInDays: number;
  joinedDaysAgo: number;
  /** Attendance rate over the last 3 months, 0-100. */
  attendance: number;
  payments: PaymentRec[];
};

function hash(i: number, salt: number) {
  let x = Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 7, 40503);
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519);
  x ^= x >>> 13;
  return (x >>> 0) % 100000;
}

const BOYS: Bi[] = [
  { ar: "يوسف", en: "Youssef" }, { ar: "أحمد", en: "Ahmed" }, { ar: "آدم", en: "Adam" },
  { ar: "زين", en: "Zain" }, { ar: "حمزة", en: "Hamza" }, { ar: "خالد", en: "Khaled" },
  { ar: "علي", en: "Ali" }, { ar: "مازن", en: "Mazen" }, { ar: "يزن", en: "Yazan" },
  { ar: "ريان", en: "Rayan" }, { ar: "كريم", en: "Karim" }, { ar: "زياد", en: "Ziad" },
  { ar: "مصطفى", en: "Mostafa" }, { ar: "إبراهيم", en: "Ibrahim" }, { ar: "سيف", en: "Saif" },
  { ar: "بلال", en: "Bilal" }, { ar: "فارس", en: "Fares" }, { ar: "جاد", en: "Jad" },
  { ar: "حسن", en: "Hassan" }, { ar: "تامر", en: "Tamer" }, { ar: "نادر", en: "Nader" },
  { ar: "هادي", en: "Hadi" },
];
const GIRLS: Bi[] = [
  { ar: "سلمى", en: "Salma" }, { ar: "مايا", en: "Maya" }, { ar: "نور", en: "Nour" },
  { ar: "جنى", en: "Jana" }, { ar: "رنا", en: "Rana" }, { ar: "سارة", en: "Sara" },
  { ar: "دانة", en: "Dana" }, { ar: "ليلى", en: "Layla" }, { ar: "تالا", en: "Tala" },
  { ar: "ملك", en: "Malak" }, { ar: "ريم", en: "Reem" }, { ar: "فرح", en: "Farah" },
  { ar: "يارا", en: "Yara" }, { ar: "آية", en: "Aya" }, { ar: "هنا", en: "Hana" },
  { ar: "جود", en: "Jood" },
];
const FAMILIES: Bi[] = [
  { ar: "حداد", en: "Haddad" }, { ar: "ناصر", en: "Nasser" }, { ar: "خليل", en: "Khalil" },
  { ar: "منصور", en: "Mansour" }, { ar: "صالح", en: "Saleh" }, { ar: "فاروق", en: "Farouk" },
  { ar: "بركات", en: "Barakat" }, { ar: "حمدان", en: "Hamdan" }, { ar: "سليمان", en: "Suleiman" },
  { ar: "عزيز", en: "Aziz" }, { ar: "درويش", en: "Darwish" }, { ar: "جابر", en: "Jaber" },
  { ar: "قاسم", en: "Kassem" }, { ar: "عثمان", en: "Othman" }, { ar: "يونس", en: "Younes" },
];
const FATHERS: Bi[] = [
  { ar: "سمير", en: "Samir" }, { ar: "طارق", en: "Tarek" }, { ar: "نبيل", en: "Nabil" },
  { ar: "وليد", en: "Waleed" }, { ar: "عماد", en: "Imad" }, { ar: "ماجد", en: "Majed" },
  { ar: "فادي", en: "Fadi" }, { ar: "سامي", en: "Sami" }, { ar: "عادل", en: "Adel" },
  { ar: "باسم", en: "Basem" }, { ar: "هاني", en: "Hani" }, { ar: "رامي", en: "Rami" },
];

const METHODS: PayMethod[] = ["card", "cash", "transfer"];

function classForAge(age: number) {
  if (age <= 8) return "beg";
  if (age <= 12) return "adv";
  if (age <= 16) return "teen";
  return "adult";
}

function buildBeltHistory(belt: number, lastPromoDaysAgo: number, i: number): BeltRec[] {
  const coaches = ["karim", "layla", "hassan"];
  const out: BeltRec[] = [];
  for (let b = belt; b >= 1; b--) {
    const daysAgo = lastPromoDaysAgo + (belt - b) * (110 + (hash(i, b) % 50));
    out.push({
      belt: b,
      daysAgo,
      score: 78 + (hash(i, 40 + b) % 21),
      coachId: coaches[hash(i, 70 + b) % 3],
    });
  }
  return out;
}

function buildPayments(plan: Plan, expiresInDays: number, i: number): PaymentRec[] {
  const cycle = PLAN_DAYS[plan];
  const lastPaid = Math.max(0, cycle - expiresInDays);
  const count = plan === "annual" ? 1 : 4;
  return Array.from({ length: count }, (_, k) => ({
    amount: PLAN_PRICE[plan],
    daysAgo: lastPaid + k * cycle,
    method: METHODS[hash(i, 90 + k) % 3],
  }));
}

function makeMember(args: {
  id: string; name: Bi; gender: Gender; age: number; belt: number; lastPromo: number;
  plan: Plan; expiresInDays: number; attendance: number; branchId: string; parentId: string; i: number;
}): Member {
  const { i, belt } = args;
  const joined = belt === 0
    ? 20 + (hash(i, 3) % 70)
    : args.lastPromo + (belt - 1) * 130 + 100 + (hash(i, 5) % 60);
  return {
    id: args.id,
    name: args.name,
    gender: args.gender,
    age: args.age,
    classId: classForAge(args.age),
    branchId: args.branchId,
    parentId: args.parentId,
    belt,
    beltHistory: buildBeltHistory(belt, args.lastPromo, i),
    plan: args.plan,
    expiresInDays: args.expiresInDays,
    joinedDaysAgo: joined,
    attendance: args.attendance,
    payments: buildPayments(args.plan, args.expiresInDays, i),
  };
}

/** A Jordanian mobile number: +962 7X XXX XXXX. */
function jordanPhone(i: number) {
  const operator = ["77", "78", "79"][i % 3];
  const mid = String(300 + (hash(i, 50) % 600));
  const end = String(1000 + (hash(i, 51) % 9000));
  return `+962 ${operator} ${mid} ${end}`;
}

// The family used for the parents' phone demo.
export const DEMO_PARENT_ID = "p1";

const parents: Parent[] = [
  { id: "p1", name: { ar: "محمد الراشد", en: "Mohammed Al-Rashid" }, phone: "+962 79 512 3401" },
];

const members: Member[] = [
  makeMember({ id: "m1", name: { ar: "عمر الراشد", en: "Omar Al-Rashid" }, gender: "m", age: 10, belt: 2, lastPromo: 125, plan: "monthly", expiresInDays: 3, attendance: 94, branchId: "main", parentId: "p1", i: 1 }),
  makeMember({ id: "m2", name: { ar: "لينا الراشد", en: "Lina Al-Rashid" }, gender: "f", age: 7, belt: 1, lastPromo: 80, plan: "monthly", expiresInDays: 19, attendance: 88, branchId: "main", parentId: "p1", i: 2 }),
];

for (let n = 0; n < 46; n++) {
  const i = n + 10;
  const gender: Gender = n % 2 === 0 ? "m" : "f";
  const first = gender === "m" ? BOYS[Math.floor(n / 2) % BOYS.length] : GIRLS[Math.floor(n / 2) % GIRLS.length];
  const fam = FAMILIES[n % FAMILIES.length];
  const dad = FATHERS[(n * 5) % FATHERS.length];
  const adult = n % 9 === 8;
  const age = adult ? 18 + (hash(i, 1) % 14) : 5 + (hash(i, 1) % 12);
  const belt = adult
    ? 3 + (hash(i, 2) % 4)
    : Math.min(5, Math.max(0, Math.floor((age - 5) * 0.4 + (hash(i, 2) % 3) - 1)));
  const plan: Plan = n % 4 === 0 ? "quarterly" : n % 9 === 0 ? "annual" : "monthly";
  const expiresInDays =
    n % 6 === 1 ? 1 + (hash(i, 8) % 6) :
    n % 11 === 3 ? -(1 + (hash(i, 9) % 9)) :
    9 + (hash(i, 10) % 24);
  const branchRoll = hash(i, 11) % 100;
  const parentId = `p${n + 3}`;
  parents.push({
    id: parentId,
    name: {
      ar: `${dad.ar} ${fam.ar}`,
      en: `${dad.en} ${fam.en}`,
    },
    phone: jordanPhone(n + 3),
  });
  members.push(
    makeMember({
      id: `m${n + 3}`,
      name: { ar: `${first.ar} ${fam.ar}`, en: `${first.en} ${fam.en}` },
      gender,
      age,
      belt,
      lastPromo: 30 + (hash(i, 4) % 190),
      plan,
      expiresInDays,
      attendance: 52 + (hash(i, 6) % 47),
      branchId: branchRoll < 60 ? "main" : branchRoll < 85 ? "north" : "east",
      parentId,
      i,
    })
  );
}

export const PARENTS: Parent[] = parents;
export const INITIAL_MEMBERS: Member[] = members;

export function parentOf(id: string) {
  return PARENTS.find((p) => p.id === id);
}

// ---------------------------------------------------------------- attendance

/**
 * The club is open Saturday to Thursday and closed on Fridays. Each student
 * trains three days a week: Sun/Tue/Thu or Sat/Mon/Wed (0 = Sunday ... 6 = Saturday).
 */
export function classDaysFor(m: Member) {
  return Number(m.id.replace(/\D/g, "")) % 2 === 1 ? [0, 2, 4] : [6, 1, 3];
}

/** The last 12 sessions a member could have attended, newest first. Never on a Friday. */
export function attendanceHistory(m: Member, now: Date) {
  if (m.attendance === 0) return []; // brand-new member: no sessions yet
  const days = classDaysFor(m);
  const seed = Number(m.id.replace(/\D/g, ""));
  const out: { daysAgo: number; present: boolean }[] = [];
  for (let back = 1; out.length < 12 && back < 60; back++) {
    const weekday = new Date(now.getTime() - back * 86_400_000).getUTCDay();
    if (!days.includes(weekday)) continue;
    out.push({ daysAgo: back, present: hash(seed * 31 + out.length, 17) % 100 < m.attendance });
  }
  return out;
}

/** Who was already in class before the demo started. */
export function initialPresent(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of CLASSES) {
    const roster = members.filter((m) => m.classId === c.id);
    out[c.id] = roster
      .filter((m, idx) => {
        if (c.status === "upcoming") return false;
        if (m.id === "m1") return false; // Omar is checked in live during the pitch.
        if (m.expiresInDays < 0) return false; // an expired member is never seeded as present
        if (c.status === "live") return idx % 5 < 3;
        return hash(Number(m.id.slice(1)), 21) % 100 < Math.min(95, m.attendance + 8);
      })
      .map((m) => m.id);
  }
  return out;
}

// ---------------------------------------------------------------- money

/** Last six months, oldest first. The last entry is "this month". */
export const REVENUE_SERIES = [1180, 1250, 1320, 1290, 1430, 1560];
export const NEW_MEMBERS_SERIES = [4, 6, 5, 9, 7, 8];
// Attendance % for Saturday to Thursday. The club is closed on Fridays.
export const WEEK_DAYS = [6, 0, 1, 2, 3, 4]; // 0 = Sunday ... 6 = Saturday
export const ATTENDANCE_WEEK = [82, 79, 85, 88, 81, 86];

// ---------------------------------------------------------------- competitions

export type CompEvent = {
  id: string;
  name: Bi;
  place: Bi;
  /** Negative = past. */
  inDays: number;
};

export const EVENTS: CompEvent[] = [
  { id: "e1", name: { ar: "بطولة المدينة المفتوحة", en: "City Open Championship" }, place: { ar: "صالة المدينة الرياضية", en: "City Sports Hall" }, inDays: -40 },
  { id: "e2", name: { ar: "كأس الناشئين الإقليمي", en: "Regional Youth Cup" }, place: { ar: "نادي الشرق", en: "East Club Arena" }, inDays: -130 },
  { id: "e3", name: { ar: "بطولة الصغار الوطنية", en: "National Kids Tournament" }, place: { ar: "القاعة الوطنية", en: "National Hall" }, inDays: -250 },
  { id: "e4", name: { ar: "كأس التنين الصيفي", en: "Summer Dragon Cup" }, place: { ar: "أكاديمية التنين الذهبي", en: "Golden Dragon Academy" }, inDays: 21 },
  { id: "e5", name: { ar: "البطولة الوطنية للأحزمة", en: "National Belts Championship" }, place: { ar: "مركز المؤتمرات", en: "Convention Center" }, inDays: 62 },
];

export type CompResult = {
  memberId: string;
  eventId: string;
  medal: Medal;
  category: "kata" | "kumite";
};

const MEDALS: Medal[] = ["gold", "silver", "bronze", "participation"];

const results: CompResult[] = [
  { memberId: "m1", eventId: "e1", medal: "gold", category: "kata" },
  { memberId: "m1", eventId: "e2", medal: "silver", category: "kumite" },
  { memberId: "m1", eventId: "e3", medal: "participation", category: "kata" },
  { memberId: "m2", eventId: "e1", medal: "bronze", category: "kata" },
];
for (const m of members) {
  const s = Number(m.id.slice(1));
  if (s <= 2 || m.belt === 0) continue;
  (["e1", "e2", "e3"] as const).forEach((ev, k) => {
    if (hash(s * 7 + k, 33) % 100 < 28) {
      results.push({
        memberId: m.id,
        eventId: ev,
        medal: MEDALS[hash(s + k, 34) % 4],
        category: hash(s, 35) % 2 === 0 ? "kata" : "kumite",
      });
    }
  });
}
export const COMP_RESULTS: CompResult[] = results;

export const MEDAL_COLOR: Record<Medal, string> = {
  gold: "#eab308",
  silver: "#94a3b8",
  bronze: "#c2763e",
  participation: "#64748b",
};
