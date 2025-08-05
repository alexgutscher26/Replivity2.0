import React from "react";
import { api } from "@/trpc/server";
import { type FeatureKey } from "@/server/db/schema/feature-permissions-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ServerFeatureAccessGuardProps {
  featureKey: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Server-side component that conditionally renders children based on feature access
 * This component runs during SSR and doesn't cause hydration issues
 */ 
export async function ServerFeatureAccessGuard({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
}: ServerFeatureAccessGuardProps) {
  try {
    const hasAccess = await api.featurePermissions.hasFeatureAccess({
      featureKey,
    });

    // User has access - render children
    if (hasAccess) {
      return <>{children}</>;
    }

    // User doesn't have access - show fallback or upgrade prompt
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return <ServerUpgradePrompt featureKey={featureKey} />;
    }

    // Default: render nothing
    return null;
  } catch {
    // If there's an error (e.g., no session), show upgrade prompt
    if (showUpgradePrompt) {
      return <ServerUpgradePrompt featureKey={featureKey} />;
    }
    return null;
  }
}

/**
 * Server-side upgrade prompt component
 */
function ServerUpgradePrompt({ featureKey }: { featureKey: FeatureKey }) {
  const featureDisplayNames: Record<FeatureKey, string> = {
    ai_caption_generator: "AI Caption Generator",
    tweet_generator: "Tweet Generator",
    bio_optimizer: "Bio & Profile Optimizer",
    browser_extension: "Browser Extension",
    link_in_bio_creator: "Link-in-Bio Creator",
    profile_audit: "Profile Audit & Suggestions",
    ab_testing: "A/B Testing for Profiles",
    hashtag_generator: "Hashtag Generator",
    blog_management: "Blog Management",
    comment_moderation: "Comment Moderation",
    reports: "Reports",
    analytics: "Analytics",
    products_management: "Products Management",
    users_management: "Users Management",
  };

  const featureName = featureDisplayNames[featureKey] ?? featureKey;

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium text-amber-800">
            {featureName} - Premium Feature
          </p>
          <p className="text-sm text-amber-700">
            Upgrade your plan to access this feature and unlock more powerful tools.
          </p>
        </div>
        <Button asChild size="sm" className="ml-4">
          <Link href="/dashboard/settings/billing">
            Upgrade Plan
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}