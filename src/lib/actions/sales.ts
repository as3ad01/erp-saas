"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";
import type { CompanyRole, PaymentMethod } from "@/generated/prisma/enums";

const CAN_SELL: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER", "CASHIER"];

export async function createCustomer(formData: FormData) {
  const { company } = await requireCompanyContext({ module: "SALES" });

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) throw new Error("Customer name is required");

  await prisma.customer.create({
    data: { companyId: company.id, name, phone: phone || null },
  });

  revalidatePath("/sales");
}

// The one place a sale gets created. Runs as a single transaction so a sale,
// its stock decrements, and its accounting entry either all happen or none
// do -- this is what makes Sales/Inventory/Accounting act as one connected
// system instead of three things a user has to keep in sync by hand.
// Prices are always looked up server-side from the current Product row,
// never trusted from the client, to prevent tampering.
export async function createSale(input: {
  items: { productId: string; quantity: number }[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
}) {
  const { company, userId, role } = await requireCompanyContext({ module: "SALES" });
  if (!CAN_SELL.includes(role)) {
    throw new Error("You don't have permission to process sales");
  }

  if (!input.items.length) throw new Error("Add at least one product to the cart");
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Invalid quantity in cart");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, companyId: company.id, isActive: true },
    });

    const productById = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const lineItems: { productId: string; quantity: number; unitPrice: number; lineTotal: number }[] =
      [];

    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) throw new Error("A product in the cart is no longer available");
      if (product.stockQty < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
      const unitPrice = Number(product.sellPrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      lineItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, lineTotal });
    }

    const sale = await tx.sale.create({
      data: {
        companyId: company.id,
        customerId: input.customerId,
        cashierId: userId,
        subtotal,
        total: subtotal,
        paymentMethod: input.paymentMethod,
        status: "COMPLETED",
        items: { create: lineItems },
      },
      include: { items: true },
    });

    for (const item of lineItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          companyId: company.id,
          productId: item.productId,
          type: "SALE",
          quantityChange: -item.quantity,
          referenceType: "Sale",
          referenceId: sale.id,
        },
      });
    }

    await tx.ledgerEntry.create({
      data: {
        companyId: company.id,
        type: "INCOME",
        category: "Sales",
        amount: subtotal,
        referenceType: "Sale",
        referenceId: sale.id,
      },
    });

    return { saleId: sale.id, total: subtotal };
  });

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return result;
}
