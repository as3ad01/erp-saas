import { UserButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNav } from "./mobile-nav";
import type { CompanyRole, Module } from "@/generated/prisma/enums";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export function Topbar({
  companyName,
  role,
  enabledModules,
  dict,
  locale,
}: {
  companyName: string;
  role: CompanyRole;
  enabledModules: Module[];
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <MobileNav
          companyName={companyName}
          enabledModules={enabledModules}
          dict={dict}
          locale={locale}
        />
        <span className="font-medium md:hidden">{companyName}</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{dict.roles[role]}</Badge>
        <LanguageToggle locale={locale} />
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
