import { requireCompanyMembership } from "@/lib/auth";
import { saveSetupModules } from "@/lib/actions/setup";
import { ALL_MODULES, moduleInfo } from "@/lib/modules";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SetupModulesPage() {
  const { company } = await requireCompanyMembership();
  const dict = getDictionary(await getLocale());
  const info = moduleInfo(dict);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.setup.modules.title}</CardTitle>
        <CardDescription>{dict.setup.modules.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveSetupModules} className="grid gap-4">
          {ALL_MODULES.map((mod) => (
            <Label
              key={mod}
              htmlFor={`module-${mod}`}
              className="flex items-start gap-3 rounded-lg border border-input p-3 has-data-checked:border-primary"
            >
              <Checkbox
                id={`module-${mod}`}
                name="modules"
                value={mod}
                defaultChecked={company.enabledModules.includes(mod)}
              />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">{info[mod].label}</span>
                <span className="text-sm text-muted-foreground">{info[mod].description}</span>
              </span>
            </Label>
          ))}
          <Button type="submit" className="w-fit">
            {dict.common.continue}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
