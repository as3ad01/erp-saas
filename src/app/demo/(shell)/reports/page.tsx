import { FeatureGate } from "@/demo/components/bits";
import { ReportsPage } from "@/demo/pages/reports";

export default function Page() {
  return (
    <FeatureGate feature="reports">
      <ReportsPage />
    </FeatureGate>
  );
}
