import { api, HydrateClient } from "@/trpc/server";
import ContentSection from "./_components/content-section";
import FeaturesSection from "./_components/feature-section";
import HeroSection from "./_components/hero-section";
import PricingTable from "./_components/pricing-table";
import PrivacyControlSection from "./_components/privacy-control-section";
import StatsSection from "./_components/stats-section";
import SocialProof from "./_components/socialproof";
import FinalCTA from "./_components/finalcta";

// Structured data for pricing and subscription plans
const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Replivity AI Social Media Management",
  "description": "AI-powered social media automation and response generation platform with multiple subscription tiers.",
  "brand": {
    "@type": "Brand",
    "name": "Replivity"
  },
  "category": "Software",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Plan",
      "description": "Get started with basic AI social media features at no cost.",
      "price": "0",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "0",
        "priceCurrency": "USD",
        "billingIncrement": "P1M",
        "unitText": "monthly"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "seller": {
        "@type": "Organization",
        "name": "Replivity"
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Basic AI Social Media Management",
        "serviceType": "SoftwareApplication"
      }
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "description": "Advanced AI features with unlimited responses and premium support.",
      "price": "29",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "29",
        "priceCurrency": "USD",
        "billingIncrement": "P1M",
        "unitText": "monthly"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "seller": {
        "@type": "Organization",
        "name": "Replivity"
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Professional AI Social Media Management",
        "serviceType": "SoftwareApplication"
      }
    },
    {
      "@type": "Offer",
      "name": "Enterprise Plan",
      "description": "Custom enterprise solution with dedicated support and advanced analytics.",
      "price": "99",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "99",
        "priceCurrency": "USD",
        "billingIncrement": "P1M",
        "unitText": "monthly"
      },
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "seller": {
        "@type": "Organization",
        "name": "Replivity"
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Enterprise AI Social Media Management",
        "serviceType": "SoftwareApplication"
      }
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "reviewBody": "Replivity has transformed our social media management. The AI responses are incredibly natural and save us hours every day."
    }
  ]
};

export default async function Home() {
  // Prefetch data in an async block
  await (async () => {
    try {
      await Promise.all([
        api.settings.site.prefetch(),
        api.products.active.prefetch(),
        api.settings.currency.prefetch(),
        api.settings.downloadExtension.prefetch(),
      ]);
    } catch (error) {
      // Silently handle prefetch errors
      console.error("Failed to prefetch data:", error);
    }
  })();

  return (
    <HydrateClient>
      {/* Structured Data for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingStructuredData)
        }}
      />
      
      <HeroSection />
      <PrivacyControlSection />
      <SocialProof />
      <FeaturesSection />
      <StatsSection />
      <ContentSection />
      <PricingTable />
      <FinalCTA />
    </HydrateClient>
  );
}
