import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { SetupStepper } from "@/components/setup/setup-stepper";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  if (!ctx.company) redirect("/onboarding");
  if (ctx.company.onboardingCompletedAt) redirect("/dashboard");
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <SetupStepper dict={dict} />
        {children}
      </div>
    </div>
  );
}
