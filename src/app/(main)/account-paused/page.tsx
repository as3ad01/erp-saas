import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/config";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPausedPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  if (
    !ctx.company ||
    (ctx.company.subscriptionStatus !== "PAST_DUE" && ctx.company.subscriptionStatus !== "CANCELED")
  ) {
    redirect("/");
  }
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.accountPaused.title}</CardTitle>
          <CardDescription>
            {t(dict.accountPaused.description, {
              name: ctx.company.name || dict.accountPaused.fallbackName,
            })}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
