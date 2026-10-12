import { BELTS, CLASSES, CLUB, type Lang, type Member } from "./data";
import { dictionaries, fmt } from "./i18n";
import { money, relDays } from "./format";

export type WaKind = "welcome" | "arrival" | "promotion" | "reminder" | "receipt" | "note";

export type WaMessage = {
  id: string;
  parentId: string;
  memberId: string;
  kind: WaKind;
  day: "today" | "yesterday";
  h: number;
  m: number;
  /** Created during this session (drives the notification banner). */
  live?: boolean;
  belt?: number;
  note?: string;
  classId?: string;
  amount?: number;
  days?: number;
  text?: string;
};

/**
 * The demo story is set in the early evening, after the 4 PM class. Live messages
 * continue from 5:40 PM, one minute apart, so the chat is always in order.
 */
export function demoClock(seq: number) {
  const total = 17 * 60 + 40 + seq;
  return { h: Math.floor(total / 60) % 24, m: total % 60 };
}

/** Plain text of a message, in the viewer's language. */
export function messageLines(msg: WaMessage, member: Member, lang: Lang): string[] {
  const d = dictionaries[lang].wa;
  const club = CLUB.name[lang];
  const name = member.name[lang].split(" ")[0];
  const g = member.gender;

  switch (msg.kind) {
    case "welcome":
      return fmt(d.welcome, { club }).split("\n");
    case "arrival": {
      const cls = CLASSES.find((c) => c.id === msg.classId);
      return [fmt(g === "m" ? d.arrivalM : d.arrivalF, { name, class: cls?.name[lang] ?? "" })];
    }
    case "promotion": {
      const beltName = BELTS[msg.belt ?? 0].name[lang];
      const belt = lang === "en" ? beltName.toLowerCase() : beltName;
      const lines = [fmt(g === "m" ? d.promotionM : d.promotionF, { name, belt })];
      lines.push(fmt(d.promotionTail, { club }));
      if (msg.note) lines.push(fmt(d.promotionNote, { note: msg.note }));
      return lines;
    }
    case "reminder":
      return fmt((msg.days ?? 0) < 0 ? d.reminderLate : d.reminder, {
        name,
        amount: money(msg.amount ?? 0, lang),
        when: relDays(msg.days ?? 0, lang),
      }).split("\n");
    case "note":
      return (msg.text ?? "").split("\n");
    case "receipt":
      return fmt(d.receipt, { name, amount: money(msg.amount ?? 0, lang) }).split("\n");
  }
}
