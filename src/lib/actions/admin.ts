"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/auth";

// Platform Super Admin onboards a new client: creates an empty Company record
// and authorizes the client's email. The client completes their own signup
// with that email, is linked as COMPANY_ADMIN automatically (see the Clerk
// webhook handler), and fills in their own company profile, modules, and
// staff during the first-time setup wizard -- no invite email round-trip,
// and no need for the Super Admin to know anything but the email.
export async function createCompanyWithAdmin(formData: FormData) {
  await requirePlatformAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("Email is required");
  }

  const company = await prisma.company.create({
    data: { subscriptionStatus: "PENDING" },
  });

  await prisma.authorizedSignup.create({
    data: {
      email,
      companyId: company.id,
      role: "COMPANY_ADMIN",
    },
  });

  revalidatePath("/admin");
}

// Fixes a typo'd authorized email before the client has signed up with it --
// only allowed while the signup is still unconsumed, since after that the
// email is just history (the CompanyUser link is what matters by then).
export async function updatePendingSignupEmail(authorizedSignupId: string, newEmail: string) {
  await requirePlatformAdmin();

  const email = newEmail.trim().toLowerCase();
  if (!email) {
    throw new Error("Email is required");
  }

  const authorization = await prisma.authorizedSignup.findUnique({
    where: { id: authorizedSignupId },
  });
  if (!authorization || authorization.consumedAt) {
    throw new Error("This signup can no longer be edited");
  }

  await prisma.authorizedSignup.update({
    where: { id: authorizedSignupId },
    data: { email },
  });

  revalidatePath("/admin");
}

// Toggles a company between ACTIVE and PAST_DUE -- the "pause for
// non-payment" lever. Blocks all sign-in/app access while paused (see
// requireCompanyMembership() in src/lib/auth.ts) without touching any data,
// so reactivating just flips it back on.
export async function toggleCompanyPause(formData: FormData) {
  await requirePlatformAdmin();

  const companyId = String(formData.get("companyId") ?? "");
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error("Company not found");

  await prisma.company.update({
    where: { id: companyId },
    data: { subscriptionStatus: company.subscriptionStatus === "ACTIVE" ? "PAST_DUE" : "ACTIVE" },
  });

  revalidatePath("/admin");
}

// Permanently deletes a company and everything under it (cascades to
// CompanyUser, AuthorizedSignup, products, sales, etc.) -- irreversible.
export async function deleteCompany(companyId: string) {
  await requirePlatformAdmin();

  await prisma.company.delete({ where: { id: companyId } });

  revalidatePath("/admin");
}
