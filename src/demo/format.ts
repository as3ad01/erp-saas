import type { Lang } from "./data";

const DAY = 86_400_000;

/** Jordanian dinar: "30 د.أ" in Arabic, "JD 30" in English. Western digits always. */
export function money(n: number, lang: Lang) {
  const v = n.toLocaleString("en-US");
  return lang === "ar" ? `${v} د.أ` : `JD ${v}`;
}

export function plainNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function pct(n: number) {
  return `${Math.round(n)}%`;
}

function intlLocale(lang: Lang) {
  // "nu-latn" keeps Western digits (0-9) in Arabic text, always.
  // ar-JO uses the Levantine month names Jordanians actually say (آب, أيلول, تشرين الأول).
  return lang === "ar" ? "ar-JO-u-nu-latn" : "en-US";
}

export function dateOffset(now: Date, daysAgo: number) {
  return new Date(now.getTime() - daysAgo * DAY);
}

export function formatDate(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}

export function formatMonthYear(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}

const AR_MONTHS_SHORT = [
  "كانون 2", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين 1", "تشرين 2", "كانون 1",
];

/** Short month label for chart axes. */
export function formatMonth(now: Date, monthsAgo: number, lang: Lang) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  if (lang === "ar") return AR_MONTHS_SHORT[d.getUTCMonth()];
  return new Intl.DateTimeFormat(intlLocale(lang), { month: "short", timeZone: "UTC" }).format(d);
}

export function formatWeekday(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), { weekday: "short", timeZone: "UTC" }).format(
    dateOffset(now, daysAgo)
  );
}

export function formatTime(h: number, m: number, lang: Lang) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, "0");
  const suffix = lang === "ar" ? (h < 12 ? "ص" : "م") : h < 12 ? "AM" : "PM";
  return `${h12}:${mm} ${suffix}`;
}

/** "in 3 days", "tomorrow", "2 days ago"... n > 0 is the future. */
export function relDays(n: number, lang: Lang) {
  const a = Math.abs(n);
  if (lang === "en") {
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n > 0 ? `in ${a} days` : `${a} days ago`;
  }
  if (n === 0) return "اليوم";
  if (n === 1) return "غدًا";
  if (n === -1) return "أمس";
  if (a === 2) return n > 0 ? "بعد يومين" : "قبل يومين";
  const unit = a <= 10 ? `${a} أيام` : `${a} يومًا`;
  return n > 0 ? `بعد ${unit}` : `قبل ${unit}`;
}

export function formatDay(now: Date, daysAgo: number, lang: Lang) {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dateOffset(now, daysAgo));
}

/** Short weekday name for a fixed weekday (0 = Sunday ... 6 = Saturday), independent of today's date. */
export function weekdayName(day: number, lang: Lang) {
  // 2024-01-07 was a Sunday.
  const d = new Date(Date.UTC(2024, 0, 7 + day));
  return new Intl.DateTimeFormat(intlLocale(lang), { weekday: "short", timeZone: "UTC" }).format(d);
}

/** "10 yrs" / "10 سنوات". Arabic counted nouns change form with the number. */
export function years(n: number, lang: Lang) {
  if (lang === "en") return `${n} yrs`;
  if (n === 1) return "سنة";
  if (n === 2) return "سنتان";
  return n <= 10 ? `${n} سنوات` : `${n} سنة`;
}
