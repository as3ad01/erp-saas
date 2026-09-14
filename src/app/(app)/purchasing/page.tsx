import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupplier } from "@/lib/actions/purchasing";
import { NewPurchaseOrderDialog } from "@/components/purchasing/new-purchase-order-dialog";
import { ReceiveOrderDialog } from "@/components/purchasing/receive-order-dialog";
import { CancelOrderDialog } from "@/components/purchasing/cancel-order-dialog";
import { PurchaseOrderDetailDialog } from "@/components/purchasing/purchase-order-detail-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CompanyRole } from "@/generated/prisma/enums";

const CAN_MANAGE: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER"];
const PAGE_SIZE = 20;

export default async function PurchasingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { company, role } = await requireCompanyContext({ module: "PURCHASING" });
  const dict = getDictionary(await getLocale());
  const canManage = CAN_MANAGE.includes(role);

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const ordersWhere = {
    companyId: company.id,
    ...(q ? { supplier: { name: { contains: q, mode: "insensitive" as const } } } : {}),
  };

  const [suppliers, products, orders, ordersCount] = await Promise.all([
    prisma.supplier.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { companyId: company.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.purchaseOrder.findMany({
      where: ordersWhere,
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.purchaseOrder.count({ where: ordersWhere }),
  ]);
  const totalPages = Math.max(1, Math.ceil(ordersCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.nav.purchasing}</h1>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">{dict.purchasing.tabs.orders}</TabsTrigger>
          <TabsTrigger value="suppliers">{dict.purchasing.tabs.suppliers}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 pt-4">
          {canManage && (
            <div className="flex justify-end">
              <NewPurchaseOrderDialog
                dict={dict}
                currency={company.currency}
                suppliers={suppliers}
                products={products.map((p) => ({
                  id: p.id,
                  name: p.name,
                  sku: p.sku,
                  costPrice: p.costPrice.toString(),
                }))}
              />
            </div>
          )}
          <Card>
            <CardContent className="overflow-x-auto pt-6">
              <form className="mb-4 flex gap-2">
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder={dict.purchasing.table.searchPlaceholder}
                  className="max-w-xs"
                />
                <Button type="submit" variant="outline">
                  {dict.common.search}
                </Button>
              </form>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.purchasing.table.supplier}</TableHead>
                    <TableHead>{dict.purchasing.table.status}</TableHead>
                    <TableHead>{dict.purchasing.table.total}</TableHead>
                    <TableHead>{dict.purchasing.table.created}</TableHead>
                    <TableHead>{dict.purchasing.table.received}</TableHead>
                    <TableHead className="text-right">{dict.purchasing.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.supplier.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            po.status === "RECEIVED"
                              ? "default"
                              : po.status === "CANCELED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {dict.purchasing.status[po.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.currency} {Number(po.total).toFixed(2)}
                      </TableCell>
                      <TableCell>{po.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>{po.receivedAt ? po.receivedAt.toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <PurchaseOrderDetailDialog
                            dict={dict}
                            currency={company.currency}
                            total={Number(po.total)}
                            items={po.items.map((item) => ({
                              id: item.id,
                              productName: item.product.name,
                              quantity: item.quantity,
                              unitCost: Number(item.unitCost),
                              lineTotal: Number(item.lineTotal),
                            }))}
                          />
                          {canManage && po.status === "ORDERED" && (
                            <>
                              <ReceiveOrderDialog dict={dict} purchaseOrderId={po.id} />
                              <CancelOrderDialog dict={dict} purchaseOrderId={po.id} />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {dict.purchasing.table.empty}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <PaginationControls dict={dict} page={page} totalPages={totalPages} searchParams={params} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{dict.purchasing.suppliers.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManage && (
                <form action={createSupplier} className="flex flex-wrap items-end gap-2">
                  <Input
                    name="name"
                    placeholder={dict.purchasing.suppliers.addName}
                    className="max-w-xs"
                    required
                  />
                  <Input
                    name="phone"
                    placeholder={dict.purchasing.suppliers.addPhone}
                    className="max-w-xs"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder={dict.purchasing.suppliers.addEmail}
                    className="max-w-xs"
                  />
                  <Button type="submit" variant="outline">
                    {dict.common.add}
                  </Button>
                </form>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.purchasing.suppliers.table.name}</TableHead>
                    <TableHead>{dict.purchasing.suppliers.table.phone}</TableHead>
                    <TableHead>{dict.purchasing.suppliers.table.email}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.phone ?? "—"}</TableCell>
                      <TableCell>{s.email ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {suppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {dict.purchasing.suppliers.empty}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
