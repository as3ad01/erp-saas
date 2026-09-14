"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/auth";
import type { CompanyRole } from "@/generated/prisma/enums";

const CAN_MANAGE: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER"];

function assertCanManage(role: CompanyRole) {
  if (!CAN_MANAGE.includes(role)) {
    throw new Error("You don't have permission to manage inventory");
  }
}

export async function createCategory(formData: FormData) {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  assertCanManage(role);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Category name is required");

  await prisma.category.create({ data: { companyId: company.id, name } });
  revalidatePath("/inventory");
}

type ProductInput = {
  name: string;
  sku: string;
  categoryId: string | null;
  costPrice: number;
  sellPrice: number;
  lowStockThreshold: number;
};

function validateProductInput(input: ProductInput) {
  if (!input.name.trim() || !input.sku.trim()) throw new Error("Name and SKU are required");
  if (
    !Number.isFinite(input.costPrice) ||
    !Number.isFinite(input.sellPrice) ||
    input.costPrice < 0 ||
    input.sellPrice < 0
  ) {
    throw new Error("Enter valid prices");
  }
  if (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0) {
    throw new Error("Enter a valid low stock threshold");
  }
}

// Every stock-affecting write goes through a transaction that also writes a
// StockMovement row, so stock levels stay reconstructable/auditable -- never
// update Product.stockQty directly outside of these actions.
export async function createProduct(input: ProductInput & { initialStock: number }) {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  assertCanManage(role);
  validateProductInput(input);

  const initialStock = Number.isInteger(input.initialStock) ? input.initialStock : 0;
  if (initialStock < 0) throw new Error("Initial stock can't be negative");

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        companyId: company.id,
        name: input.name.trim(),
        sku: input.sku.trim(),
        categoryId: input.categoryId,
        costPrice: input.costPrice,
        sellPrice: input.sellPrice,
        lowStockThreshold: input.lowStockThreshold,
        stockQty: initialStock,
      },
    });

    if (initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          companyId: company.id,
          productId: product.id,
          type: "ADJUSTMENT",
          quantityChange: initialStock,
          reason: "Initial stock",
        },
      });
    }
  });

  revalidatePath("/inventory");
}

export async function updateProduct(productId: string, input: ProductInput) {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  assertCanManage(role);
  validateProductInput(input);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.companyId !== company.id) throw new Error("Product not found");

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name.trim(),
      sku: input.sku.trim(),
      categoryId: input.categoryId,
      costPrice: input.costPrice,
      sellPrice: input.sellPrice,
      lowStockThreshold: input.lowStockThreshold,
    },
  });

  revalidatePath("/inventory");
}

export async function toggleProductActive(productId: string) {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  assertCanManage(role);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.companyId !== company.id) throw new Error("Product not found");

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/inventory");
}

export async function adjustStock(input: {
  productId: string;
  quantityChange: number;
  reason: string;
}) {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  assertCanManage(role);

  if (!Number.isInteger(input.quantityChange) || input.quantityChange === 0) {
    throw new Error("Enter a non-zero whole number");
  }

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || product.companyId !== company.id) throw new Error("Product not found");

  const newQty = product.stockQty + input.quantityChange;
  if (newQty < 0) throw new Error("Stock cannot go below zero");

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: input.productId }, data: { stockQty: newQty } });
    await tx.stockMovement.create({
      data: {
        companyId: company.id,
        productId: input.productId,
        type: "ADJUSTMENT",
        quantityChange: input.quantityChange,
        reason: input.reason.trim() || null,
      },
    });
  });

  revalidatePath("/inventory");
}
