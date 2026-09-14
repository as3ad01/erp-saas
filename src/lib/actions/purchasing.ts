"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";
import type { CompanyRole } from "@/generated/prisma/enums";

const CAN_MANAGE: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER"];

function assertCanManage(role: CompanyRole) {
  if (!CAN_MANAGE.includes(role)) {
    throw new Error("You don't have permission to manage purchasing");
  }
}

export async function createSupplier(formData: FormData) {
  const { company, role } = await requireCompanyContext({ module: "PURCHASING" });
  assertCanManage(role);

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!name) throw new Error("Supplier name is required");

  await prisma.supplier.create({
    data: { companyId: company.id, name, phone: phone || null, email: email || null },
  });

  revalidatePath("/purchasing");
}

// Creates the order at ORDERED status directly -- v1 skips a separate DRAFT
// editing stage to keep the workflow to two meaningful states: ordered
// (placed with the supplier, not yet in your stock) and received.
export async function createPurchaseOrder(input: {
  supplierId: string;
  items: { productId: string; quantity: number; unitCost: number }[];
}) {
  const { company, userId, role } = await requireCompanyContext({ module: "PURCHASING" });
  assertCanManage(role);

  if (!input.supplierId) throw new Error("Select a supplier");
  if (!input.items.length) throw new Error("Add at least one product");
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Invalid quantity");
    }
    if (!Number.isFinite(item.unitCost) || item.unitCost < 0) {
      throw new Error("Invalid unit cost");
    }
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
  if (!supplier || supplier.companyId !== company.id) throw new Error("Supplier not found");

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, companyId: company.id },
  });
  const productIds = new Set(products.map((p) => p.id));
  for (const item of input.items) {
    if (!productIds.has(item.productId)) throw new Error("A product in the order is invalid");
  }

  const total = input.items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);

  await prisma.purchaseOrder.create({
    data: {
      companyId: company.id,
      supplierId: input.supplierId,
      createdById: userId,
      status: "ORDERED",
      total,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lineTotal: item.unitCost * item.quantity,
        })),
      },
    },
  });

  revalidatePath("/purchasing");
}

// Mirror of createSale(): one transaction that increases stock, writes the
// audit trail, and records the accounting entry, so receiving a PO can't
// leave inventory and accounting out of sync with each other.
export async function receivePurchaseOrder(purchaseOrderId: string) {
  const { company, role } = await requireCompanyContext({ module: "PURCHASING" });
  assertCanManage(role);

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { items: true },
  });
  if (!po || po.companyId !== company.id) throw new Error("Purchase order not found");
  if (po.status === "RECEIVED") throw new Error("This order was already received");

  await prisma.$transaction(async (tx) => {
    for (const item of po.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQty: { increment: item.quantity },
          costPrice: item.unitCost,
        },
      });
      await tx.stockMovement.create({
        data: {
          companyId: company.id,
          productId: item.productId,
          type: "PURCHASE",
          quantityChange: item.quantity,
          referenceType: "PurchaseOrder",
          referenceId: po.id,
        },
      });
    }

    await tx.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });

    await tx.ledgerEntry.create({
      data: {
        companyId: company.id,
        type: "EXPENSE",
        category: "Purchases",
        amount: po.total,
        referenceType: "PurchaseOrder",
        referenceId: po.id,
      },
    });
  });

  revalidatePath("/purchasing");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

// No inventory/accounting side effects here on purpose -- those only happen
// at receipt time, and an ORDERED-but-not-yet-received order never touched
// either, so canceling it is a plain status change.
export async function cancelPurchaseOrder(purchaseOrderId: string) {
  const { company, role } = await requireCompanyContext({ module: "PURCHASING" });
  assertCanManage(role);

  const po = await prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });
  if (!po || po.companyId !== company.id) throw new Error("Purchase order not found");
  if (po.status === "RECEIVED") throw new Error("A received order can't be canceled");
  if (po.status === "CANCELED") throw new Error("This order was already canceled");

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: { status: "CANCELED" },
  });

  revalidatePath("/purchasing");
}
