import { FeatureGate } from "@/demo/components/bits";
import { BranchesPage } from "@/demo/pages/branches";

export default function Page() {
  return (
    <FeatureGate feature="branches">
      <BranchesPage />
    </FeatureGate>
  );
}
