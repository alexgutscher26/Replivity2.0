import { api } from "@/trpc/react";
import {
  AVAILABLE_FEATURES,
  type FeatureKey,
} from "@/server/db/schema/feature-permissions-schema";

/**
 * Hook to check if the current user has access to a specific feature
 * @param featureKey - The feature key to check access for
 * @returns Object with loading state, access status, and error
 */
export function useFeatureAccess(featureKey: FeatureKey) {
  const {
    data: hasAccess,
    isLoading,
    error,
  } = api.featurePermissions.hasFeatureAccess.useQuery(
    { featureKey },
    {
      // Cache the result for 5 minutes to avoid repeated API calls
      staleTime: 5 * 60 * 1000,
      // Keep the data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
  );

  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    error,
  };
}

/**
 * Hook to get all features available to the current user
 * @returns Object with user features, loading state, and error
 */
export function useUserFeatures() {
  const {
    data: features,
    isLoading,
    error,
  } = api.featurePermissions.getUserFeatures.useQuery(undefined, {
    // Cache the result for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    features: features ?? [],
    isLoading,
    error,
    hasFeature: (featureKey: FeatureKey) =>
      features?.some((feature) => feature.key === featureKey) ?? false,
  };
}

/**
 * Hook for admin users to manage feature permissions for products
 * @returns Object with queries and mutations for managing feature permissions
 */
export function useFeaturePermissionsAdmin() {
  const utils = api.useUtils();

  const availableFeatures =
    api.featurePermissions.getAvailableFeatures.useQuery();
  const productsWithFeatures =
    api.featurePermissions.getProductsWithFeatureCounts.useQuery();

  const updateProductFeatures =
    api.featurePermissions.updateProductFeatures.useMutation({
      onSuccess: () => {
        // Invalidate related queries to refresh the UI
        void utils.featurePermissions.getProductsWithFeatureCounts.invalidate();
        void utils.featurePermissions.getUserFeatures.invalidate();
        void utils.featurePermissions.hasFeatureAccess.invalidate();
      },
    });

  const getProductFeatures = (productId: string) => {
    return api.featurePermissions.getProductFeatures.useQuery(
      { productId },
      {
        enabled: Boolean(productId),
        staleTime: 2 * 60 * 1000, // 2 minutes for admin data
      },
    );
  };

  return {
    availableFeatures: availableFeatures.data ?? [],
    productsWithFeatures: productsWithFeatures.data ?? [],
    isLoading: availableFeatures.isLoading || productsWithFeatures.isLoading,
    error: availableFeatures.error ?? productsWithFeatures.error,
    updateProductFeatures,
    getProductFeatures,
  };
}

/**
 * Utility function to check if a feature is available (without React hook)
 * This is useful for server-side checks or non-React contexts
 */
export const isFeatureAvailable = (
  featureKey: string,
): featureKey is FeatureKey => {
  return Object.values(AVAILABLE_FEATURES).includes(featureKey as FeatureKey);
};

/**
 * Get feature metadata without making API calls
 */
export const getFeatureMetadata = () => {
  return {
    AVAILABLE_FEATURES,
    featureKeys: Object.values(AVAILABLE_FEATURES) as FeatureKey[],
    featureCount: Object.keys(AVAILABLE_FEATURES).length,
  };
};
