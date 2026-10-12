import { FeatureGate } from "@/demo/components/bits";
import { WebsitePage } from "@/demo/pages/website";

export default function Page() {
  return (
    <FeatureGate feature="website">
      <WebsitePage />
    </FeatureGate>
  );
}
