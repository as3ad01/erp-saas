import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/lib/actions/sales";
import { POSPanel } from "@/components/sales/pos-panel";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
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

const CAN_SELL: CompanyRole[] = ["COMPANY_ADMIN", "MANAGER", "CASHIER"];

export default async function SalesPage() {
  const { company, role } = await requireCompanyContext({ module: "SALES" });
  const dict = getDictionary(await getLocale());
  const canSell = CAN_SELL.includes(role);

  const [products, customers, sales] = await Promise.all([
    prisma.product.findMany({
      where: { companyId: company.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } }),
    prisma.sale.findMany({
      where: { companyId: company.id },
      include: { customer: true, cashier: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.nav.sales}</h1>

      <Tabs defaultValue={canSell ? "pos" : "history"}>
        <TabsList>
          {canSell && <TabsTrigger value="pos">{dict.sales.tabs.pos}</TabsTrigger>}
          <TabsTrigger value="history">{dict.sales.tabs.history}</TabsTrigger>
          <TabsTrigger value="customers">{dict.sales.tabs.customers}</TabsTrigger>
        </TabsList>

        {canSell && (
          <TabsContent value="pos" className="pt-4">
            <POSPanel
              dict={dict}
              currency={company.currency}
              customers={customers}
              products={products.map((p) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                sellPrice: p.sellPrice.toString(),
                stockQty: p.stockQty,
              }))}
            />
          </TabsContent>
        )}

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardContent className="overflow-x-auto pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.sales.history.date}</TableHead>
                    <TableHead>{dict.sales.history.customer}</TableHead>
                    <TableHead>{dict.sales.history.cashier}</TableHead>
                    <TableHead>{dict.sales.history.items}</TableHead>
                    <TableHead>{dict.sales.history.total}</TableHead>
                    <TableHead>{dict.sales.history.payment}</TableHead>
                    <TableHead>{dict.sales.history.status}</TableHead>
                    <TableHead className="text-right">{dict.admin.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.createdAt.toLocaleString()}</TableCell>
                      <TableCell>{sale.customer?.name ?? dict.sales.pos.walkIn}</TableCell>
                      <TableCell>{sale.cashier.name ?? sale.cashier.email}</TableCell>
                      <TableCell>{sale.items.length}</TableCell>
                      <TableCell>
                        {company.currency} {Number(sale.total).toFixed(2)}
                      </TableCell>
                      <TableCell>{dict.sales.paymentMethods[sale.paymentMethod]}</TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "COMPLETED" ? "default" : "secondary"}>
                          {dict.sales.saleStatus[sale.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <SaleDetailDialog
                            dict={dict}
                            currency={company.currency}
                            total={Number(sale.total)}
                            items={sale.items.map((item) => ({
                              id: item.id,
                              productName: item.product.name,
                              quantity: item.quantity,
                              unitPrice: Number(item.unitPrice),
                              lineTotal: Number(item.lineTotal),
                            }))}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {dict.sales.history.empty}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{dict.sales.customers.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canSell && (
                <form action={createCustomer} className="flex flex-wrap items-end gap-2">
                  <Input name="name" placeholder={dict.sales.customers.addName} className="max-w-xs" required />
                  <Input
                    name="phone"
                    placeholder={dict.sales.customers.addPhone}
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
                    <TableHead>{dict.sales.customers.table.name}</TableHead>
                    <TableHead>{dict.sales.customers.table.phone}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.phone ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        {dict.sales.customers.empty}
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
