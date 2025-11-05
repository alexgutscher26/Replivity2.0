"use client";

import React from "react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { type FeatureKey } from "@/server/db/schema/feature-permissions-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureAccessGuardProps {
  featureKey: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on feature access
 * Shows upgrade prompt or custom fallback when access is denied
 */
export function FeatureAccessGuard({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  loadingComponent,
}: FeatureAccessGuardProps) {
  const { hasAccess, isLoading, error } = useFeatureAccess(featureKey);

  // Show loading state
  if (isLoading) {
    return (
      loadingComponent ?? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Checking access...</span>
        </div>
      )
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error checking feature access: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt featureKey={featureKey} />;
  }

  // Default: render nothing
  return null;
}

/**
 * Default upgrade prompt component
 */
function UpgradePrompt({ featureKey }: { featureKey: FeatureKey }) {
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
            Upgrade your plan to access this feature and unlock more powerful
            tools.
          </p>
        </div>
        <Button asChild size="sm" className="ml-4">
          <Link href="/dashboard/settings/billing">Upgrade Plan</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Higher-order component version of FeatureAccessGuard
 */
export function withFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureKey: FeatureKey,
  options?: {
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
  },
) {
  const WithFeatureAccessComponent = (props: P) => {
    return (
      <FeatureAccessGuard
        featureKey={featureKey}
        fallback={options?.fallback}
        showUpgradePrompt={options?.showUpgradePrompt}
      >
        <WrappedComponent {...props} />
      </FeatureAccessGuard>
    );
  };

  WithFeatureAccessComponent.displayName = `withFeatureAccess(${WrappedComponent.displayName ?? WrappedComponent.name})`;

  return WithFeatureAccessComponent;
}

/**
 * Hook-based feature access check for conditional rendering
 */
export function useFeatureGuard(featureKey: FeatureKey) {
  const { hasAccess, isLoading, error } = useFeatureAccess(featureKey);

  const FeatureGuard = ({
    children,
    fallback,
  }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => (
    <FeatureAccessGuard featureKey={featureKey} fallback={fallback}>
      {children}
    </FeatureAccessGuard>
  );

  return {
    hasAccess,
    isLoading,
    error,
    FeatureGuard,
  };
}
