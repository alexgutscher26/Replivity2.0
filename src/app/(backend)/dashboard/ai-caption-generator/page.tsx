import { Separator } from "@/components/ui/separator";
import { AiCaptionGeneratorForm } from "./_components/ai-caption-generator-form";
import { ServerFeatureAccessGuard } from "@/components/server-feature-access-guard";
import { AVAILABLE_FEATURES } from "@/server/db/schema/feature-permissions-schema";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Caption Generator - Create Engaging Social Media Captions",
  description:
    "Generate compelling social media captions with AI. Upload images and create platform-specific captions for Instagram, Facebook, Twitter, and more using advanced AI models.",
  keywords: [
    "AI caption generator",
    "social media captions",
    "Instagram captions",
    "AI content creation",
    "image to caption",
    "social media automation",
  ],
  openGraph: {
    title: "AI Caption Generator | Replivity",
    description:
      "Generate compelling social media captions with AI. Upload images and create platform-specific captions instantly.",
  },
};

// Structured data for AI Caption Generator tool
const captionGeneratorStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Caption Generator",
  description:
    "Advanced AI-powered tool for generating engaging social media captions from images across multiple platforms including Instagram, Twitter, Facebook, and LinkedIn.",
  url: "https://replivity.com/dashboard/ai-caption-generator",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Content Creation",
  operatingSystem: "Web Browser",
  isPartOf: {
    "@type": "WebSite",
    name: "Replivity",
    url: "https://replivity.com",
  },
  creator: {
    "@type": "Organization",
    name: "Replivity",
  },
  featureList: [
    "AI-powered caption generation",
    "Image-to-caption conversion",
    "Multi-platform optimization",
    "Hashtag suggestions",
    "Tone customization",
    "Length optimization",
    "Emoji integration",
    "Brand voice consistency",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Content Creators, Social Media Managers, Businesses",
  },
  potentialAction: {
    "@type": "CreateAction",
    name: "Generate Caption",
    description: "Create engaging social media captions from images using AI",
  },
};

/**
 * Renders the AI Caption Generator page with a form for generating captions.
 */
export default function AiCaptionGeneratorPage() {
  return (
    <>
      {/* Structured Data for AI Caption Generator */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(captionGeneratorStructuredData),
        }}
      />

      <ServerFeatureAccessGuard
        featureKey={AVAILABLE_FEATURES.AI_CAPTION_GENERATOR}
      >
        <div className="flex-1 space-y-6 p-10 pb-16">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">
              AI Caption Generator
            </h2>
            <p className="text-muted-foreground">
              Upload an image and generate engaging captions for your social
              media posts using AI.
            </p>
          </div>
          <Separator />
          <AiCaptionGeneratorForm />
        </div>
      </ServerFeatureAccessGuard>
    </>
  );
}
