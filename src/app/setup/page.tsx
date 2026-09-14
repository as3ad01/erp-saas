import { requireCompanyMembership } from "@/lib/auth";
import { saveSetupProfile } from "@/lib/actions/setup";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SetupProfilePage() {
  const { company } = await requireCompanyMembership();
  const dict = getDictionary(await getLocale());

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.setup.profile.title}</CardTitle>
        <CardDescription>{dict.setup.profile.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveSetupProfile} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{dict.common.companyName}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={company.name}
              required
              placeholder="Acme Retail"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">{dict.common.currency}</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue={company.currency}
              required
              placeholder="USD"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">{dict.common.addressOptional}</Label>
            <Input id="address" name="address" defaultValue={company.address ?? ""} />
          </div>
          <Button type="submit" className="w-fit">
            {dict.common.continue}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
