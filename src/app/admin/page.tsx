import { prisma } from "@/lib/prisma";
import { createCompanyWithAdmin, toggleCompanyPause } from "@/lib/actions/admin";
import { EditPendingEmailDialog } from "@/components/admin/edit-pending-email-dialog";
import { DeleteCompanyDialog } from "@/components/admin/delete-company-dialog";
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

export default async function AdminPage() {
  const dict = getDictionary(await getLocale());
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { authorizedSignups: { where: { consumedAt: null } } },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dict.admin.addCompany.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCompanyWithAdmin} className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{dict.admin.addCompany.emailLabel}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="owner@acme.com"
              />
            </div>
            <Button type="submit">{dict.admin.addCompany.submit}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.admin.table.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.admin.table.name}</TableHead>
                <TableHead>{dict.admin.table.status}</TableHead>
                <TableHead>{dict.admin.table.setup}</TableHead>
                <TableHead>{dict.admin.table.pendingSignup}</TableHead>
                <TableHead>{dict.admin.table.created}</TableHead>
                <TableHead className="text-right">{dict.admin.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => {
                const pending = c.authorizedSignups[0];
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.name || dict.admin.table.pendingSetup}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.subscriptionStatus === "ACTIVE" ? "default" : "secondary"}>
                        {dict.subscriptionStatus[c.subscriptionStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.onboardingCompletedAt ? "default" : "outline"}>
                        {c.onboardingCompletedAt
                          ? dict.admin.table.setupComplete
                          : dict.admin.table.setupNotStarted}
                      </Badge>
                    </TableCell>
                    <TableCell>{pending?.email ?? "—"}</TableCell>
                    <TableCell>{c.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {pending && (
                          <EditPendingEmailDialog
                            authorizedSignupId={pending.id}
                            currentEmail={pending.email}
                            dict={dict}
                          />
                        )}
                        <form action={toggleCompanyPause}>
                          <input type="hidden" name="companyId" value={c.id} />
                          <Button type="submit" variant="outline" size="sm">
                            {c.subscriptionStatus === "ACTIVE"
                              ? dict.admin.table.pause
                              : dict.admin.table.reactivate}
                          </Button>
                        </form>
                        <DeleteCompanyDialog companyId={c.id} companyName={c.name} dict={dict} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {dict.admin.table.empty}
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
