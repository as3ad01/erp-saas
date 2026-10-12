import { FeatureGate } from "@/demo/components/bits";
import { ParentPage } from "@/demo/pages/parent";

export default function Page() {
  return (
    <FeatureGate feature="parent">
      <ParentPage />
    </FeatureGate>
  );
}
