import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OnboardingPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  if (ctx.company) redirect("/dashboard");
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.onboarding.title}</CardTitle>
          <CardDescription>{dict.onboarding.description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
