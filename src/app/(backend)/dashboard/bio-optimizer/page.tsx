import { BioProfileOptimizer } from "./_components/bio-profile-optimizer";
import { ServerFeatureAccessGuard } from "@/components/server-feature-access-guard";
import { AVAILABLE_FEATURES } from "@/server/db/schema/feature-permissions-schema";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Bio & Profile Optimizer - Create Compelling Social Media Bios",
  description: "Optimize your social media profiles with AI-powered bio generation. Create engaging bios for Instagram, Twitter, LinkedIn, and other platforms that attract your target audience.",
  keywords: [
    "bio optimizer",
    "social media bio",
    "Instagram bio generator",
    "Twitter bio",
    "LinkedIn profile",
    "profile optimization",
    "AI bio writer"
  ],
  openGraph: {
    title: "Bio & Profile Optimizer | Replivity",
    description: "Optimize your social media profiles with AI-powered bio generation for maximum engagement.",
  },
};

// Structured data for Bio & Profile Optimizer tool
const bioOptimizerStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Bio & Profile Optimizer",
  "description": "AI-powered tool for creating compelling social media bios and optimizing profiles across Instagram, Twitter, LinkedIn, and other platforms to attract target audiences.",
  "url": "https://replivity.com/dashboard/bio-optimizer",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Profile Optimization",
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
    "AI-powered bio generation",
    "Multi-platform optimization",
    "Personality-based customization",
    "Industry-specific templates",
    "Character count optimization",
    "Keyword integration",
    "Call-to-action suggestions",
    "Brand voice alignment"
  ],
  "audience": {
    "@type": "Audience",
    "audienceType": "Professionals, Influencers, Businesses, Content Creators"
  },
  "potentialAction": {
    "@type": "CreateAction",
    "name": "Optimize Bio",
    "description": "Create and optimize social media bios using AI"
  }
};

/**
 * Renders the Bio & Profile Optimizer page with structured data and a title.
 */
export default function BioOptimizerPage() {
  return (
    <>
      {/* Structured Data for Bio & Profile Optimizer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bioOptimizerStructuredData)
        }}
      />
      
      <ServerFeatureAccessGuard featureKey={AVAILABLE_FEATURES.BIO_OPTIMIZER}>
        <div className="container mx-auto py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Bio & Profile Optimizer</h1>
            <p className="text-muted-foreground mt-2">
              Create compelling social media bios that capture your brand voice and attract your target audience.
            </p>
          </div>
          <BioProfileOptimizer />
        </div>
      </ServerFeatureAccessGuard>
    </>
  );
}