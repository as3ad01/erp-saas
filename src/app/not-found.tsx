import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/demo/components/logo";
import { cn } from "@/lib/utils";

const TEXT = {
  ar: {
    club: "أكاديمية التنين الذهبي",
    title: "الصفحة غير موجودة",
    body: "الرابط الذي فتحته غير صحيح أو لم يعد متاحًا.",
    cta: "العودة إلى العرض التجريبي",
  },
  en: {
    club: "Golden Dragon Academy",
    title: "Page not found",
    body: "That link is wrong or no longer available.",
    cta: "Back to the demo",
  },
};

export default async function NotFound() {
  const store = await cookies();
  const t = TEXT[store.get("locale")?.value === "en" ? "en" : "ar"];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-3">
        <Logo className="size-10" />
        <span className="text-lg font-bold">{t.club}</span>
      </div>
      <p className="text-7xl font-extrabold tracking-tight text-primary tabular-nums">404</p>
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.body}</p>
      </div>
      <Link href="/demo" className={cn(buttonVariants({ size: "lg" }), "h-10 px-5 text-base")}>
        {t.cta}
      </Link>
    </main>
  );
}
