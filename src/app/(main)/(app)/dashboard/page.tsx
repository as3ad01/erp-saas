import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { company } = await requireCompanyContext();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const [productCount, products, todaySales, monthLedger] = await Promise.all([
    prisma.product.count({ where: { companyId: company.id, isActive: true } }),
    prisma.product.findMany({
      where: { companyId: company.id, isActive: true },
      select: { stockQty: true, lowStockThreshold: true },
    }),
    prisma.sale.aggregate({
      where: { companyId: company.id, createdAt: { gte: startOfDay }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.ledgerEntry.groupBy({
      by: ["type"],
      where: { companyId: company.id, date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  const lowStockCount = products.filter((p) => p.stockQty <= p.lowStockThreshold).length;
  const income = Number(monthLedger.find((g) => g.type === "INCOME")?._sum.amount ?? 0);
  const expense = Number(monthLedger.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0);

  const stats = [
    { label: dict.dashboard.activeProducts, value: productCount.toLocaleString() },
    { label: dict.dashboard.lowStockItems, value: lowStockCount.toLocaleString() },
    {
      label: dict.dashboard.todaysSales,
      value: `${company.currency} ${Number(todaySales._sum.total ?? 0).toFixed(2)}`,
      sub: t(dict.dashboard.saleCount, { count: todaySales._count }),
    },
    {
      label: dict.dashboard.monthProfit,
      value: `${company.currency} ${(income - expense).toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {t(dict.dashboard.welcome, { name: company.name })}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.value}</div>
              {stat.sub && <p className="text-xs text-muted-foreground">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
