"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMembership } from "@/lib/auth";
import type { CompanyRole } from "@/generated/prisma/enums";

const VALID_ROLES: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER", "CASHIER", "ACCOUNTANT"];

// Same allowlist mechanism the Super Admin uses to onboard a company, reused
// here so a Company Admin can add their own staff the identical way -- and
// reused again for the setup wizard's optional staff-invite step, which is
// why this uses the looser requireCompanyMembership() (works before the
// wizard finishes) rather than requireCompanyContext().
export async function inviteStaffMember(formData: FormData) {
  const { userId, company, role } = await requireCompanyMembership();

  if (role !== "COMPANY_ADMIN") {
    throw new Error("Only company admins can add staff");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const staffRole = String(formData.get("role") ?? "") as CompanyRole;

  if (!email || !VALID_ROLES.includes(staffRole)) {
    throw new Error("A valid email and role are required");
  }

  await prisma.authorizedSignup.create({
    data: {
      email,
      companyId: company.id,
      role: staffRole,
      invitedBy: userId,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/setup/staff");
}
