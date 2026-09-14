import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncUserAndConsumeAuthorization } from "@/lib/user-sync";
import type { CompanyRole, Module } from "@/generated/prisma/enums";

// Session + tenant context for the current request. A user can technically
// belong to more than one company (e.g. staff at two clients), but v1 only
// ever acts on the first membership -- multi-company switching is a later
// feature, not needed for launch.
export async function getSessionContext() {
  const { userId } = await auth();
  if (!userId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { companyUsers: { include: { company: true } } },
  });

  if (!dbUser) {
    // The Clerk webhook hasn't synced this user yet (delivery lag, or it
    // simply can't reach localhost in dev) -- sync directly from Clerk so
    // the app is correct regardless of webhook delivery.
    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses[0]?.emailAddress;
    if (!clerkUser || !email) return null;

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    await syncUserAndConsumeAuthorization(userId, email, name);

    dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyUsers: { include: { company: true } } },
    });
  }
  if (!dbUser) return null;

  const membership = dbUser.companyUsers[0] ?? null;

  return {
    userId,
    user: dbUser,
    isPlatformAdmin: dbUser.isPlatformAdmin,
    company: membership?.company ?? null,
    role: membership?.role ?? null,
  };
}

// Guard for the setup wizard: requires a company link, but -- unlike
// requireCompanyContext() -- does NOT require onboarding to be finished,
// since the wizard's whole job is to finish it. Still blocks a paused/
// canceled company -- a Super Admin pausing a client for non-payment should
// take effect everywhere, not just past the setup wizard.
export async function requireCompanyMembership() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  if (!ctx.company) redirect("/onboarding");
  if (ctx.company.subscriptionStatus === "PAST_DUE" || ctx.company.subscriptionStatus === "CANCELED") {
    redirect("/account-paused");
  }
  return ctx as typeof ctx & {
    company: NonNullable<typeof ctx.company>;
    role: CompanyRole;
  };
}

// Guard for the (app) layout and its pages: bounces unauthenticated / not-
// yet-linked users to sign-in or the onboarding screen, and sends anyone
// who hasn't finished the first-time setup wizard there instead of the
// dashboard. Pass `module` to also gate a page behind that module being
// enabled for the company (falls back to /dashboard if it isn't).
export async function requireCompanyContext(options?: { module?: Module }) {
  const ctx = await requireCompanyMembership();
  if (!ctx.company.onboardingCompletedAt) redirect("/setup");
  if (options?.module && !ctx.company.enabledModules.includes(options.module)) {
    redirect("/dashboard");
  }
  return ctx;
}

export async function requirePlatformAdmin() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  if (!ctx.isPlatformAdmin) redirect("/");
  return ctx;
}
