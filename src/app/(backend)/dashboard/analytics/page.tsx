import { Separator } from "@/components/ui/separator";
import { getSession } from "@/server/utils";
import { redirect } from "next/navigation";
import AdvancedAnalyticsDashboard from "./_components/advanced-analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (session?.user?.role !== "admin") {
    return redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          Advanced Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for your AI social media
          platform.
        </p>
      </div>
      <Separator />
      <AdvancedAnalyticsDashboard />
    </div>
  );
}
