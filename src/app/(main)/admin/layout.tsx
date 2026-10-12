import { requirePlatformAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b px-6 font-semibold">
        {dict.admin.heading}
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
