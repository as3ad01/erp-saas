"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";
import type { Module } from "@/generated/prisma/enums";

const VALID_MODULES: Module[] = ["INVENTORY", "SALES", "PURCHASING", "ACCOUNTING"];

// Post-setup module editing from Settings (the wizard has its own
// saveSetupModules action in src/lib/actions/setup.ts, which redirects
// to the next step instead of just revalidating in place).
export async function updateEnabledModules(formData: FormData) {
  const { company, role } = await requireCompanyContext();
  if (role !== "COMPANY_ADMIN") {
    throw new Error("Only company admins can change enabled modules");
  }

  const selected = formData.getAll("modules").map(String) as Module[];
  const enabledModules = selected.filter((m) => VALID_MODULES.includes(m));

  await prisma.company.update({
    where: { id: company.id },
    data: { enabledModules },
  });

  revalidatePath("/settings");
}
