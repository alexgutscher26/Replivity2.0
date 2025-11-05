# AppSumo Licensing API (v2) Integration

This document outlines the complete implementation of AppSumo Licensing API (v2) integration for the Replivity platform.

## Overview

The AppSumo integration allows users to purchase lifetime deals through AppSumo and activate premium features using license keys. The implementation includes:

- **Database Schema**: AppSumo license management
- **API Routes**: Webhook handlers and OAuth callbacks
- **tRPC Routers**: License management endpoints
- **Frontend Components**: License activation and management UI
- **Authentication**: OAuth integration with AppSumo

## Architecture

### Database Schema

**Table**: `replier_appsumo_license`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `license_key` | VARCHAR(255) | Unique license key from AppSumo |
| `user_id` | UUID | Foreign key to user (nullable) |
| `product_id` | UUID | Foreign key to products table |
| `status` | VARCHAR(50) | License status (pending, active, deactivated, expired) |
| `appsumo_user_id` | VARCHAR(255) | AppSumo user identifier |
| `appsumo_email` | VARCHAR(255) | User's AppSumo email |
| `appsumo_order_id` | VARCHAR(255) | AppSumo order identifier |
| `appsumo_product_id` | VARCHAR(255) | AppSumo product identifier |
| `appsumo_variant_id` | VARCHAR(255) | AppSumo product variant (optional) |
| `activated_at` | TIMESTAMP | License activation timestamp |
| `deactivated_at` | TIMESTAMP | License deactivation timestamp |
| `last_used_at` | TIMESTAMP | Last usage timestamp |
| `metadata` | JSONB | Additional license metadata |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

### API Endpoints

#### Webhook Handler
**Endpoint**: `/api/webhook/appsumo`
**Method**: POST
**Purpose**: Handle AppSumo webhook events

**Supported Events**:
- `license.activated` - New license activation
- `license.deactivated` - License deactivation
- `license.upgraded` - License upgrade
- `license.downgraded` - License downgrade
- `license.refunded` - License refund/cancellation

#### OAuth Callback
**Endpoint**: `/api/auth/appsumo/callback`
**Method**: GET
**Purpose**: Handle AppSumo OAuth authentication

**Flow**:
1. Exchange authorization code for access token
2. Fetch user information from AppSumo
3. Link license to existing user or redirect to registration

### tRPC Router

**Router**: `appsumoLicense`

**Procedures**:
- `activateLicense` - Activate a new license
- `updateLicenseStatus` - Update license status
- `updateLicenseProduct` - Update license product (upgrades/downgrades)
- `linkLicenseToUser` - Link license to user account
- `validateLicense` - Validate license key
- `getUserLicenses` - Get user's licenses
- `getAllLicenses` - Get all licenses (admin)
- `getLicenseStats` - Get license statistics (admin)

### Frontend Components

#### AppSumo License Form
**Location**: `/dashboard/settings/account`
**File**: `appsumo-license-form.tsx`

**Features**:
- Display linked licenses
- License key input and validation
- License status indicators
- Link to AppSumo marketplace

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AppSumo Integration
APPSUMO_CLIENT_ID=your_appsumo_client_id
APPSUMO_CLIENT_SECRET=your_appsumo_client_secret
APPSUMO_WEBHOOK_SECRET=your_webhook_secret
APPSUMO_API_BASE_URL=https://api.appsumo.com
```

## Setup Instructions

### 1. Database Migration

Run the database migration to create the AppSumo license table:

```bash
bun run db:migrate
# or
bun run db:migrate
```

### 2. AppSumo Partner Configuration

1. **Register as AppSumo Partner**:
   - Contact AppSumo to become a partner
   - Obtain API credentials (Client ID, Client Secret)
   - Set up webhook endpoint URL

2. **Configure Webhook**:
   - URL: `https://yourdomain.com/api/webhook/appsumo`
   - Events: All license events
   - Secret: Generate a secure webhook secret

3. **OAuth Configuration**:
   - Callback URL: `https://yourdomain.com/api/auth/appsumo/callback`
   - Scopes: `user:read`, `license:read`

### 3. Product Configuration

The migration automatically creates a default "AppSumo Lifetime Deal" product. You can customize this in the admin panel or database.

## Usage Flow

### For New Users (via AppSumo)

1. User purchases lifetime deal on AppSumo
2. AppSumo sends webhook to activate license
3. User clicks "Access Product" on AppSumo
4. OAuth flow redirects to your app
5. User registers/logs in and license is automatically linked

### For Existing Users

1. User purchases lifetime deal on AppSumo
2. User goes to Account Settings → AppSumo Licenses
3. User enters license key manually
4. License is validated and linked to account

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using HMAC-SHA256
2. **OAuth Security**: Standard OAuth 2.0 flow with state parameter
3. **License Validation**: License keys are validated against AppSumo API
4. **Rate Limiting**: Implement rate limiting on license endpoints
5. **Audit Logging**: All license operations are logged

## Error Handling

### Common Errors

- **Invalid License Key**: License not found in AppSumo system
- **Already Linked**: License already linked to another account
- **Expired License**: License has been deactivated or refunded
- **Product Mismatch**: AppSumo product doesn't match your products

### Error Responses

All API endpoints return standardized error responses:

```json
{
  "error": {
    "code": "LICENSE_NOT_FOUND",
    "message": "License key not found",
    "details": {}
  }
}
```

## Testing

### Webhook Testing

Use tools like ngrok for local webhook testing:

```bash
ngrok http 3000
# Use the ngrok URL for webhook configuration
```

### License Testing

1. Create test licenses in AppSumo sandbox
2. Test webhook events using AppSumo's webhook testing tool
3. Verify OAuth flow in sandbox environment

## Monitoring

### Key Metrics

- License activation rate
- License linking success rate
- Webhook processing time
- OAuth conversion rate
- License usage patterns

### Logging

All AppSumo operations are logged with:
- License key (masked)
- User ID
- Operation type
- Timestamp
- Result status

## Troubleshooting

### Common Issues

1. **Webhook Not Received**:
   - Check webhook URL configuration
   - Verify webhook secret
   - Check firewall/security settings

2. **OAuth Redirect Issues**:
   - Verify callback URL configuration
   - Check OAuth credentials
   - Ensure HTTPS in production

3. **License Validation Failures**:
   - Verify AppSumo API credentials
   - Check license key format
   - Ensure license is active in AppSumo

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=appsumo:*
```

## Support

For AppSumo integration support:

1. Check AppSumo partner documentation
2. Contact AppSumo partner support
3. Review webhook logs and error messages
4. Test in AppSumo sandbox environment

## Future Enhancements

- **Multi-tier Licenses**: Support for different license tiers
- **License Transfer**: Allow users to transfer licenses
- **Bulk Operations**: Admin tools for bulk license management
- **Analytics Dashboard**: Detailed license analytics
- **Automated Refunds**: Handle refund webhooks automatically