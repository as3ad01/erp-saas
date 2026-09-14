"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";
import type { CompanyRole } from "@/generated/prisma/enums";

const CAN_VIEW: CompanyRole[] = ["COMPANY_ADMIN", "ACCOUNTANT"];

// For expenses that don't come from a PurchaseOrder -- rent, utilities,
// salaries, anything else. Sales and receiving stock write their own
// LedgerEntry rows automatically; this is the only manual entry point.
export async function addManualExpense(formData: FormData) {
  const { company, role } = await requireCompanyContext({ module: "ACCOUNTING" });
  if (!CAN_VIEW.includes(role)) {
    throw new Error("You don't have permission to record expenses");
  }

  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const dateInput = String(formData.get("date") ?? "").trim();

  if (!category) throw new Error("Category is required");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

  const date = dateInput ? new Date(`${dateInput}T12:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");

  await prisma.ledgerEntry.create({
    data: {
      companyId: company.id,
      type: "EXPENSE",
      category,
      amount,
      description: description || null,
      date,
    },
  });

  revalidatePath("/accounting");
  revalidatePath("/dashboard");
}
