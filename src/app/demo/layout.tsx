import { cookies } from "next/headers";
import { DemoProvider } from "@/demo/state";
import type { Tier } from "@/demo/data";

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const lang = store.get("locale")?.value === "en" ? "en" : "ar";
  const rawPkg = store.get("demo_pkg")?.value;
  const pkg: Tier = rawPkg === "basic" || rawPkg === "standard" ? rawPkg : "pro";

  return (
    <DemoProvider initialLang={lang} initialPkg={pkg} nowIso={new Date().toISOString()}>
      {children}
    </DemoProvider>
  );
}
