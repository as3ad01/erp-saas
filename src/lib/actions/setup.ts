"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCompanyMembership } from "@/lib/auth";
import type { Module } from "@/generated/prisma/enums";

const VALID_MODULES: Module[] = ["INVENTORY", "SALES", "PURCHASING", "ACCOUNTING"];

export async function saveSetupProfile(formData: FormData) {
  const { company } = await requireCompanyMembership();

  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "")
    .trim()
    .toUpperCase();
  const address = String(formData.get("address") ?? "").trim();

  if (!name || !currency) {
    throw new Error("Name and currency are required");
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { name, currency, address: address || null },
  });

  redirect("/setup/modules");
}

export async function saveSetupModules(formData: FormData) {
  const { company } = await requireCompanyMembership();

  const selected = formData.getAll("modules").map(String) as Module[];
  const enabledModules = selected.filter((m) => VALID_MODULES.includes(m));

  await prisma.company.update({
    where: { id: company.id },
    data: { enabledModules },
  });

  redirect("/setup/staff");
}

export async function completeSetup() {
  const { company } = await requireCompanyMembership();

  await prisma.company.update({
    where: { id: company.id },
    data: { onboardingCompletedAt: new Date() },
  });

  redirect("/dashboard");
}
