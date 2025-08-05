import { Separator } from "@/components/ui/separator";
import HashtagGeneratorForm from "./_components/hashtag-generator-form";
import HashtagSuggestions from "./_components/hashtag-suggestions";
import HashtagPerformanceAnalytics from "./_components/hashtag-performance-analytics";
import CustomHashtagSets from "./_components/custom-hashtag-sets";
import HashtagCompetitionAnalysis from "./_components/hashtag-competition-analysis";

export default function HashtagGeneratorPage() {
  return (
    <div className="flex-1 space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">AI Hashtag Generator</h2>
        <p className="text-muted-foreground">
          Generate trending hashtags for your social media content using AI.
        </p>
      </div>
      <Separator />
      <div className="grid gap-6">
        <HashtagSuggestions />
      </div>
      <Separator />
      <div className="grid gap-6">
        <HashtagGeneratorForm />
      </div>
      <Separator />
      <div className="grid gap-6">
        <div className="space-y-0.5">
          <h3 className="text-lg font-medium">Hashtag Performance Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track the performance of your generated hashtags across different platforms.
          </p>
        </div>
        <HashtagPerformanceAnalytics />
      </div>
      <Separator />
      <div className="grid gap-6">
        <div className="space-y-0.5">
          <h3 className="text-lg font-medium">Custom Hashtag Sets</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage custom hashtag sets for recurring content themes.
          </p>
        </div>
        <CustomHashtagSets />
      </div>
      <Separator />
      <div className="grid gap-6">
        <div className="space-y-0.5">
          <h3 className="text-lg font-medium">Competition Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Analyze hashtag competition and discover optimization opportunities.
          </p>
        </div>
        <HashtagCompetitionAnalysis />
      </div>
    </div>
  );
}
