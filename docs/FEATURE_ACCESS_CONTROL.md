# Feature Access Control System

This document describes the feature access control system that allows different pricing plans to have access to different tools and features in the Replivity AI Social Media SaaS platform.

## Overview

The feature access control system enables administrators to configure which features are available for each pricing plan, providing a flexible way to create tiered subscription offerings.

## Architecture

### Database Schema

The system uses a `feature_permissions` table that links products (pricing plans) to available features:

```sql
CREATE TABLE "feature_permissions" (
  "id" text PRIMARY KEY NOT NULL,
  "product_id" text NOT NULL,
  "feature_key" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### Available Features

The following features are currently supported:

- `AI_CAPTION_GENERATOR` - AI-powered caption generation
- `TWEET_GENERATOR` - AI tweet generation tool
- `BIO_OPTIMIZER` - Social media bio optimization
- `BROWSER_EXTENSION` - Browser extension access

## Implementation Components

### 1. Database Schema (`feature-permissions-schema.ts`)

Defines the database structure and available features:

```typescript
export const AVAILABLE_FEATURES = {
  AI_CAPTION_GENERATOR: 'AI_CAPTION_GENERATOR',
  TWEET_GENERATOR: 'TWEET_GENERATOR',
  BIO_OPTIMIZER: 'BIO_OPTIMIZER',
  BROWSER_EXTENSION: 'BROWSER_EXTENSION',
} as const;
```

### 2. API Router (`feature-permissions.ts`)

Provides tRPC procedures for managing feature access:

- `getAvailableFeatures` - Get all available features
- `getProductFeatures` - Get features for a specific product
- `getUserFeatures` - Get features available to the current user
- `hasFeatureAccess` - Check if user has access to a specific feature
- `updateProductFeatures` - Update features for a product (admin only)
- `getProductFeatureCount` - Get feature count overview

### 3. React Hooks (`use-feature-access.ts`)

Provides React hooks for feature access management:

```typescript
// Check if user has access to a specific feature
const hasAccess = useFeatureAccess('AI_CAPTION_GENERATOR');

// Get all features available to the user
const { data: userFeatures } = useUserFeatures();

// Admin hook for managing product features
const { data: productFeatures, updateFeatures } = useFeaturePermissionsAdmin();
```

### 4. Feature Access Guard (`feature-access-guard.tsx`)

React component for conditionally rendering UI based on feature access:

```typescript
<FeatureAccessGuard featureKey={AVAILABLE_FEATURES.AI_CAPTION_GENERATOR}>
  <AICaptionGeneratorForm />
</FeatureAccessGuard>
```

### 5. Admin Interface (`/dashboard/feature-permissions`)

Web interface for administrators to manage feature permissions for each pricing plan.

## Usage

### For Developers

#### Protecting a Page/Component

```typescript
import { FeatureAccessGuard } from '@/components/feature-access-guard';
import { AVAILABLE_FEATURES } from '@/server/db/schema/feature-permissions-schema';

export default function MyFeaturePage() {
  return (
    <FeatureAccessGuard featureKey={AVAILABLE_FEATURES.AI_CAPTION_GENERATOR}>
      <div>Your protected content here</div>
    </FeatureAccessGuard>
  );
}
```

#### Checking Feature Access in Components

```typescript
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { AVAILABLE_FEATURES } from '@/server/db/schema/feature-permissions-schema';

function MyComponent() {
  const hasAccess = useFeatureAccess(AVAILABLE_FEATURES.TWEET_GENERATOR);
  
  if (!hasAccess) {
    return <div>Upgrade to access this feature</div>;
  }
  
  return <div>Feature content</div>;
}
```

#### Server-Side Feature Checking

```typescript
import { isFeatureAvailable } from '@/hooks/use-feature-access';

// In API routes or server components
const hasAccess = await isFeatureAvailable(userId, 'AI_CAPTION_GENERATOR');
```

### For Administrators

1. Navigate to `/dashboard/feature-permissions`
2. Select a product/pricing plan
3. Toggle features on/off for that plan
4. Save changes

## Setup Instructions

### 1. Run Database Migration

```bash
bun run db:migrate
```

This will create the `feature_permissions` table.

### 2. Seed Feature Permissions

```bash
bun run seed:features
# or
node -r ts-node/register src/scripts/seed-feature-permissions.ts
```

This will populate default feature permissions based on existing products:

- **Free Plans**: Browser Extension only
- **Basic Plans**: Browser Extension + AI Caption Generator
- **Pro Plans**: All features

### 3. Update Sidebar Navigation

The sidebar automatically filters navigation items based on user feature access. No additional configuration needed.

## Default Feature Assignments

| Plan Type | Features |
|-----------|----------|
| Free | Browser Extension |
| Basic | Browser Extension, AI Caption Generator |
| Pro | All Features |

## Security Considerations

- Feature access is checked both client-side (for UX) and server-side (for security)
- Admin-only operations are protected with role-based access control
- Feature permissions are cached for performance but invalidated on updates

## Extending the System

### Adding New Features

1. Add the feature key to `AVAILABLE_FEATURES` in `feature-permissions-schema.ts`
2. Update the `getFeatureDisplayName` and `getFeatureDescription` functions
3. Protect the new feature's pages/components with `FeatureAccessGuard`
4. Update the seeding script if needed

### Custom Feature Logic

For complex feature access logic, extend the `hasFeatureAccess` tRPC procedure or create custom hooks that combine multiple feature checks.

## Troubleshooting

### Common Issues

1. **Feature not showing in admin panel**: Ensure the feature is added to `AVAILABLE_FEATURES`
2. **User can't access feature**: Check if the user's product has the feature permission assigned
3. **Sidebar items not filtering**: Verify the feature key matches exactly in both the sidebar and feature definitions

### Debug Commands

```typescript
// Check user's current features
const { data: features } = api.featurePermissions.getUserFeatures.useQuery();
console.log('User features:', features);

// Check specific feature access
const hasAccess = api.featurePermissions.hasFeatureAccess.useQuery({
  featureKey: 'AI_CAPTION_GENERATOR'
});
console.log('Has access:', hasAccess.data);
```

## Performance Considerations

- Feature permissions are cached using TanStack Query
- Database queries use proper indexes for fast lookups
- Client-side checks are optimistic (server-side validation is authoritative)

## Future Enhancements

- Feature usage analytics and reporting
- Time-based feature access (trial periods)
- Feature-specific usage limits
- A/B testing for feature rollouts
- Granular permissions (read/write access levels)