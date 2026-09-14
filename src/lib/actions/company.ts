"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";

export async function updateCompanyProfile(formData: FormData) {
  const { company, role } = await requireCompanyContext();
  if (role !== "COMPANY_ADMIN") {
    throw new Error("Only company admins can update the company profile");
  }

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

  revalidatePath("/settings");
}
