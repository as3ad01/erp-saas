import { requireCompanyMembership } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteStaffMember } from "@/lib/actions/staff";
import { completeSetup } from "@/lib/actions/setup";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function SetupStaffPage() {
  const { company } = await requireCompanyMembership();
  const dict = getDictionary(await getLocale());

  const pending = await prisma.authorizedSignup.findMany({
    where: { companyId: company.id, consumedAt: null, invitedBy: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.setup.staff.title}</CardTitle>
        <CardDescription>{dict.setup.staff.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={inviteStaffMember} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="staffEmail">{dict.common.email}</Label>
            <Input
              id="staffEmail"
              name="email"
              type="email"
              required
              placeholder="staff@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staffRole">{dict.common.role}</Label>
            <Select name="role" defaultValue="CASHIER">
              <SelectTrigger id="staffRole" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASHIER">{dict.roles.CASHIER}</SelectItem>
                <SelectItem value="MANAGER">{dict.roles.MANAGER}</SelectItem>
                <SelectItem value="ACCOUNTANT">{dict.roles.ACCOUNTANT}</SelectItem>
                <SelectItem value="COMPANY_ADMIN">{dict.roles.COMPANY_ADMIN}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="outline">
            {dict.common.add}
          </Button>
        </form>

        {pending.length > 0 && (
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.email}</span>
                <Badge variant="outline">
                  {dict.roles[p.role]} ({dict.common.pending})
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <form action={completeSetup}>
          <Button type="submit" className="w-fit">
            {dict.setup.staff.finish}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
