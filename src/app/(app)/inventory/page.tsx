import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategory, toggleProductActive } from "@/lib/actions/inventory";
import { ProductFormDialog } from "@/components/inventory/product-form-dialog";
import { AdjustStockDialog } from "@/components/inventory/adjust-stock-dialog";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function InventoryPage() {
  const { company, role } = await requireCompanyContext({ module: "INVENTORY" });
  const dict = getDictionary(await getLocale());
  const canManage = role === "COMPANY_ADMIN" || role === "MANAGER";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { companyId: company.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { companyId: company.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{dict.nav.inventory}</h1>
        {canManage && (
          <ProductFormDialog
            dict={dict}
            categories={categories}
            trigger={<Button>{dict.inventory.addProduct}</Button>}
          />
        )}
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.inventory.categories.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.name}
                </Badge>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">{dict.inventory.categories.empty}</p>
              )}
            </div>
            <form action={createCategory} className="flex items-end gap-2">
              <Input
                name="name"
                placeholder={dict.inventory.categories.addPlaceholder}
                className="max-w-xs"
                required
              />
              <Button type="submit" variant="outline">
                {dict.common.add}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.inventory.table.sku}</TableHead>
                <TableHead>{dict.inventory.table.name}</TableHead>
                <TableHead>{dict.inventory.table.category}</TableHead>
                <TableHead>{dict.inventory.table.cost}</TableHead>
                <TableHead>{dict.inventory.table.price}</TableHead>
                <TableHead>{dict.inventory.table.stock}</TableHead>
                <TableHead>{dict.inventory.table.status}</TableHead>
                {canManage && (
                  <TableHead className="text-right">{dict.inventory.table.actions}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const isLow = p.stockQty <= p.lowStockThreshold;
                const toggleAction = toggleProductActive.bind(null, p.id);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category?.name ?? "—"}</TableCell>
                    <TableCell>
                      {company.currency} {Number(p.costPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {company.currency} {Number(p.sellPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={isLow ? "font-medium text-destructive" : ""}>
                        {p.stockQty}
                      </span>
                      {isLow && (
                        <Badge
                          variant="outline"
                          className="ms-2 border-destructive text-destructive"
                        >
                          {dict.inventory.lowStockBadge}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? dict.inventory.active : dict.inventory.inactive}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <AdjustStockDialog dict={dict} productId={p.id} currentStock={p.stockQty} />
                          <ProductFormDialog
                            dict={dict}
                            categories={categories}
                            product={{
                              id: p.id,
                              name: p.name,
                              sku: p.sku,
                              categoryId: p.categoryId,
                              costPrice: p.costPrice.toString(),
                              sellPrice: p.sellPrice.toString(),
                              lowStockThreshold: p.lowStockThreshold,
                            }}
                            trigger={
                              <Button variant="outline" size="sm">
                                {dict.common.edit}
                              </Button>
                            }
                          />
                          <form action={toggleAction}>
                            <Button type="submit" variant="outline" size="sm">
                              {p.isActive ? dict.inventory.deactivate : dict.inventory.activate}
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 8 : 7}
                    className="text-center text-muted-foreground"
                  >
                    {dict.inventory.table.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
