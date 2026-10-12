import { FeatureGate } from "@/demo/components/bits";
import { BeltsPage } from "@/demo/pages/belts";

export default function Page() {
  return (
    <FeatureGate feature="belts">
      <BeltsPage />
    </FeatureGate>
  );
}
