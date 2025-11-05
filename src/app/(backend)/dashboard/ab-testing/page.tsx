import { type Metadata } from "next";
import { ABTestingTool } from "./_components/ab-testing-tool";

export const metadata: Metadata = {
  title: "A/B Testing for Profiles",
  description:
    "Test different profile variations and compare their performance",
};

export default function ABTestingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          A/B Testing for Profiles
        </h2>
      </div>
      <ABTestingTool />
    </div>
  );
}
