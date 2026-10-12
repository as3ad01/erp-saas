import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth";

export default async function Home() {
  const ctx = await getSessionContext();

  if (!ctx) redirect("/sign-in");
  if (ctx.isPlatformAdmin) redirect("/admin");
  if (ctx.company) redirect("/dashboard");
  redirect("/onboarding");
}
