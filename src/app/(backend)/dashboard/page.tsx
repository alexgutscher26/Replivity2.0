import { Separator } from "@/components/ui/separator";
import FacebookUsage from "./_components/facebook-usage";
import HashtagUsage from "./_components/hashtag-usage";
import LinkedinUsage from "./_components/linkedin-usage";
import TotalUsage from "./_components/total-usage";
import TwitterUsage from "./_components/twitter-usage";
import { UsageOverview } from "./_components/usage-overview";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Usage Analytics",
  description: "Monitor your AI social media reply usage across platforms. Track Facebook, Twitter, LinkedIn engagement and hashtag performance with detailed analytics.",
  keywords: [
    "social media analytics",
    "usage dashboard",
    "AI reply tracking",
    "engagement metrics",
    "platform analytics",
    "social media insights",
  ],
  openGraph: {
    title: "Dashboard - Usage Analytics | Replivity",
    description: "Monitor your AI social media reply usage and engagement across all platforms.",
    type: "website",
  },
};

// Structured data for Dashboard Analytics
const dashboardStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Replivity Analytics Dashboard",
  "description": "Comprehensive analytics dashboard for monitoring AI social media reply usage, engagement metrics, and performance across multiple platforms including Facebook, Twitter, LinkedIn, and Instagram.",
  "url": "https://replivity.com/dashboard",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Analytics",
  "operatingSystem": "Web Browser",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Replivity",
    "url": "https://replivity.com"
  },
  "creator": {
    "@type": "Organization",
    "name": "Replivity"
  },
  "featureList": [
    "Real-time usage analytics",
    "Multi-platform tracking",
    "Engagement metrics",
    "Hashtag performance analysis",
    "Response generation statistics",
    "Platform-specific insights",
    "Usage trend visualization",
    "Performance optimization recommendations"
  ],
  "audience": {
    "@type": "Audience",
    "audienceType": "Social Media Managers, Content Creators, Businesses"
  },
  "potentialAction": {
    "@type": "ViewAction",
    "name": "View Analytics",
    "description": "Monitor and analyze social media engagement and AI usage statistics"
  }
};

/**
 * Renders the DashboardPage component displaying various usage statistics and analytics.
 */
export default async function DashboardPage() {
  return (
    <>
      {/* Structured Data for Analytics Dashboard */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dashboardStructuredData)
        }}
      />
      
      <div className="flex-1 space-y-6 p-10 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here&apos;s a detailed overview of your usage.
          </p>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <TotalUsage />
            <FacebookUsage />
            <TwitterUsage />
            <LinkedinUsage />
            <HashtagUsage />
          </div>
          <div className="grid gap-4">
            <UsageOverview />
          </div>
        </div>
      </div>
    </>
  );
}
