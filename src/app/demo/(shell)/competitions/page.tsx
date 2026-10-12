import { FeatureGate } from "@/demo/components/bits";
import { CompetitionsPage } from "@/demo/pages/competitions";

export default function Page() {
  return (
    <FeatureGate feature="competitions">
      <CompetitionsPage />
    </FeatureGate>
  );
}
