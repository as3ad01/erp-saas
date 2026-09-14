import { redirect } from "next/navigation";
import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addManualExpense } from "@/lib/actions/accounting";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CompanyRole } from "@/generated/prisma/enums";

const CAN_VIEW: CompanyRole[] = ["COMPANY_ADMIN", "ACCOUNTANT"];

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { company, role } = await requireCompanyContext({ module: "ACCOUNTING" });
  if (!CAN_VIEW.includes(role)) redirect("/dashboard");
  const dict = getDictionary(await getLocale());

  const params = await searchParams;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const fromStr = params.from || toDateInputValue(startOfMonth);
  const toStr = params.to || toDateInputValue(today);

  const fromDate = new Date(`${fromStr}T00:00:00`);
  const toDate = new Date(`${toStr}T23:59:59`);

  const [entries, stockRows] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where: { companyId: company.id, date: { gte: fromDate, lte: toDate } },
      orderBy: { date: "desc" },
    }),
    prisma.product.findMany({
      where: { companyId: company.id },
      select: { stockQty: true, costPrice: true },
    }),
  ]);

  const income = entries
    .filter((e) => e.type === "INCOME")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const expenses = entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const stockValuation = stockRows.reduce(
    (sum, p) => sum + p.stockQty * Number(p.costPrice),
    0
  );

  const stats = [
    { label: dict.accounting.stats.income, value: income },
    { label: dict.accounting.stats.expenses, value: expenses },
    { label: dict.accounting.stats.netProfit, value: income - expenses },
    { label: dict.accounting.stats.stockValuation, value: stockValuation },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{dict.nav.accounting}</h1>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="from">{dict.accounting.dateRange.from}</Label>
          <Input id="from" name="from" type="date" defaultValue={fromStr} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">{dict.accounting.dateRange.to}</Label>
          <Input id="to" name="to" type="date" defaultValue={toStr} />
        </div>
        <Button type="submit" variant="outline">
          {dict.accounting.dateRange.apply}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {company.currency} {stat.value.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.accounting.addExpense.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm
            action={addManualExpense}
            successMessage={dict.toasts.expenseAdded}
            errorMessage={dict.common.somethingWentWrong}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="category">{dict.accounting.addExpense.category}</Label>
              <Input
                id="category"
                name="category"
                placeholder={dict.accounting.addExpense.categoryPlaceholder}
                className="max-w-[180px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">{dict.accounting.addExpense.amount}</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="max-w-[140px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">{dict.accounting.addExpense.date}</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={toDateInputValue(today)}
                className="max-w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">{dict.accounting.addExpense.description}</Label>
              <Input id="description" name="description" className="max-w-xs" />
            </div>
            <SubmitButton>{dict.common.add}</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.accounting.ledger.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.accounting.ledger.date}</TableHead>
                <TableHead>{dict.accounting.ledger.type}</TableHead>
                <TableHead>{dict.accounting.ledger.category}</TableHead>
                <TableHead>{dict.accounting.ledger.description}</TableHead>
                <TableHead className="text-right">{dict.accounting.ledger.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === "INCOME" ? "default" : "secondary"}>
                      {dict.accounting.entryType[entry.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{entry.description ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {company.currency} {Number(entry.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {dict.accounting.ledger.empty}
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
