import { requireCompanyContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCompanyProfile } from "@/lib/actions/company";
import { updateEnabledModules } from "@/lib/actions/modules";
import { inviteStaffMember } from "@/lib/actions/staff";
import { AccountSecurityButton } from "@/components/settings/account-security-button";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ALL_MODULES, moduleInfo } from "@/lib/modules";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SettingsPage() {
  const { company, role } = await requireCompanyContext();
  const isAdmin = role === "COMPANY_ADMIN";
  const dict = getDictionary(await getLocale());
  const info = moduleInfo(dict);

  const [staff, pending] = await Promise.all([
    prisma.companyUser.findMany({
      where: { companyId: company.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.authorizedSignup.findMany({
      where: { companyId: company.id, consumedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.account.title}</CardTitle>
          <CardDescription>{dict.settings.account.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSecurityButton label={dict.settings.account.manageButton} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.profile.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm
            key={`${company.name}-${company.currency}-${company.address ?? ""}`}
            action={updateCompanyProfile}
            successMessage={dict.toasts.companyProfileUpdated}
            errorMessage={dict.common.somethingWentWrong}
            resetOnSuccess={false}
            className="grid max-w-lg gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">{dict.common.companyName}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={company.name}
                disabled={!isAdmin}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">{dict.common.currency}</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={company.currency}
                disabled={!isAdmin}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">{dict.common.address}</Label>
              <Input
                id="address"
                name="address"
                defaultValue={company.address ?? ""}
                disabled={!isAdmin}
              />
            </div>
            {isAdmin && <SubmitButton className="w-fit">{dict.common.save}</SubmitButton>}
          </ActionForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.modules.title}</CardTitle>
          <CardDescription>{dict.settings.modules.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm
            key={company.enabledModules.slice().sort().join(",")}
            action={updateEnabledModules}
            successMessage={dict.toasts.modulesUpdated}
            errorMessage={dict.common.somethingWentWrong}
            resetOnSuccess={false}
            className="grid max-w-lg gap-3"
          >
            {ALL_MODULES.map((mod) => (
              <Label
                key={mod}
                htmlFor={`settings-module-${mod}`}
                className="flex items-start gap-3 rounded-lg border border-input p-3 has-data-checked:border-primary"
              >
                <Checkbox
                  id={`settings-module-${mod}`}
                  name="modules"
                  value={mod}
                  defaultChecked={company.enabledModules.includes(mod)}
                  disabled={!isAdmin}
                />
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">{info[mod].label}</span>
                  <span className="text-sm text-muted-foreground">{info[mod].description}</span>
                </span>
              </Label>
            ))}
            {isAdmin && <SubmitButton className="w-fit">{dict.common.save}</SubmitButton>}
          </ActionForm>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.settings.addStaff.title}</CardTitle>
            <CardDescription>{dict.settings.addStaff.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={inviteStaffMember}
              successMessage={dict.toasts.staffInvited}
              errorMessage={dict.common.somethingWentWrong}
              className="flex flex-wrap items-end gap-4"
            >
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
              <SubmitButton>{dict.common.add}</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.team.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.common.name}</TableHead>
                <TableHead>{dict.common.email}</TableHead>
                <TableHead>{dict.common.role}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.user.name ?? "—"}</TableCell>
                  <TableCell>{s.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dict.roles[s.role]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {pending.map((p) => (
                <TableRow key={p.id} className="text-muted-foreground">
                  <TableCell>—</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {dict.roles[p.role]} ({dict.common.pending})
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {staff.length === 0 && pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {dict.settings.team.empty}
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
