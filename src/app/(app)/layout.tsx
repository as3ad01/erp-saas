import { requireCompanyContext } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company, role } = await requireCompanyContext();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar companyName={company.name} enabledModules={company.enabledModules} dict={dict} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          companyName={company.name}
          role={role}
          enabledModules={company.enabledModules}
          dict={dict}
          locale={locale}
        />
        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
