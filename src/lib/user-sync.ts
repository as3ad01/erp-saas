import { prisma } from "@/lib/prisma";

const PLATFORM_ADMIN_EMAILS = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Links a Clerk user into our own User table and, if their email was
// pre-authorized, into the matching company. Called from two places:
// the Clerk webhook (fast path, fires right after signup) and a lazy
// fallback in getSessionContext() (in case the webhook hasn't landed yet --
// webhook delivery isn't instantaneous even in production, and can't reach
// localhost at all in local dev). Idempotent either way.
//
// Platform admin status is entirely driven by PLATFORM_ADMIN_EMAILS -- no
// manual DB edits needed. Anyone on that list is granted it the moment their
// User row is first created (signup or first sign-in, whichever syncs first).
export async function syncUserAndConsumeAuthorization(
  id: string,
  email: string,
  name: string | null
) {
  const isPlatformAdmin = PLATFORM_ADMIN_EMAILS.includes(email.trim().toLowerCase());

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id },
      create: { id, email, name, isPlatformAdmin },
      update: { email, name, isPlatformAdmin },
    });

    const authorization = await tx.authorizedSignup.findUnique({ where: { email } });
    if (!authorization || authorization.consumedAt) return;

    await tx.companyUser.upsert({
      where: { companyId_userId: { companyId: authorization.companyId, userId: id } },
      create: { userId: id, companyId: authorization.companyId, role: authorization.role },
      update: {},
    });
    await tx.authorizedSignup.update({
      where: { id: authorization.id },
      data: { consumedAt: new Date() },
    });
    await tx.company.updateMany({
      where: { id: authorization.companyId, subscriptionStatus: "PENDING" },
      data: { subscriptionStatus: "ACTIVE" },
    });
  });
}
