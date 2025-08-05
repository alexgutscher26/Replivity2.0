/**
 * Utility functions for handling social authentication errors
 */

export interface SocialAuthError {
  title: string;
  message: string;
  code?: string;
}

/**
 * Maps common social authentication errors to user-friendly messages
 */
export function mapSocialAuthError(error: Error | string): SocialAuthError {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorString = errorMessage.toLowerCase();

  // Missing credentials errors
  if (errorString.includes('missing credentials') || errorString.includes('clientid') || errorString.includes('clientsecret')) {
    return {
      title: 'Missing Credentials',
      message: errorMessage,
      code: 'MISSING_CREDENTIALS'
    };
  }

  // Auth secret errors
  if (errorString.includes('auth secret') || errorString.includes('secret')) {
    return {
      title: 'Invalid Auth Secret',
      message: errorMessage,
      code: 'INVALID_SECRET'
    };
  }

  // Database connection errors
  if (errorString.includes('database') || errorString.includes('connection') || errorString.includes('timeout')) {
    return {
      title: 'Database Error',
      message: 'Unable to save settings. Please check your connection and try again.',
      code: 'DATABASE_ERROR'
    };
  }

  // OAuth provider errors
  if (errorString.includes('oauth') || errorString.includes('provider')) {
    return {
      title: 'Provider Configuration Error',
      message: 'There was an issue with the social provider configuration. Please check your settings.',
      code: 'PROVIDER_ERROR'
    };
  }

  // Network errors
  if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('cors')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR'
    };
  }

  // Validation errors
  if (errorString.includes('validation') || errorString.includes('invalid') || errorString.includes('required')) {
    return {
      title: 'Validation Error',
      message: errorMessage,
      code: 'VALIDATION_ERROR'
    };
  }

  // Permission errors
  if (errorString.includes('unauthorized') || errorString.includes('forbidden') || errorString.includes('permission')) {
    return {
      title: 'Permission Denied',
      message: 'You do not have permission to perform this action.',
      code: 'PERMISSION_ERROR'
    };
  }

  // Rate limiting errors
  if (errorString.includes('rate limit') || errorString.includes('too many requests')) {
    return {
      title: 'Rate Limited',
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED'
    };
  }

  // Default error
  return {
    title: 'Update Failed',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Validates social provider credentials
 */
export function validateProviderCredentials(providers: string[], credentials: Record<string, { clientId?: string; clientSecret?: string }>): string[] {
  return providers.filter((provider) => {
    const creds = credentials[provider];
    return !creds?.clientId || !creds?.clientSecret;
  });
}

/**
 * Validates auth secret strength
 */
export function validateAuthSecret(secret: string): { isValid: boolean; message?: string } {
  if (!secret) {
    return {
      isValid: false,
      message: 'Auth secret is required.'
    };
  }

  if (secret.length < 32) {
    return {
      isValid: false,
      message: 'Auth secret must be at least 32 characters long for security.'
    };
  }

  // Check for common weak patterns
  if (/^(..)\1+$/.test(secret)) {
    return {
      isValid: false,
      message: 'Auth secret should not contain repeating patterns.'
    };
  }

  if (/^[a-zA-Z]+$/.test(secret) || /^[0-9]+$/.test(secret)) {
    return {
      isValid: false,
      message: 'Auth secret should contain a mix of letters, numbers, and special characters.'
    };
  }

  return { isValid: true };
}

/**
 * Validates trusted origins format
 */
export function validateTrustedOrigins(origins: string[]): { invalidOrigins: string[]; validOrigins: string[] } {
  const invalidOrigins: string[] = [];
  const validOrigins: string[] = [];

  origins.forEach(origin => {
    if (!origin || origin.trim() === '') {
      return; // Skip empty origins
    }

    try {
      const url = new URL(origin);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        validOrigins.push(origin);
      } else {
        invalidOrigins.push(origin);
      }
    } catch {
      invalidOrigins.push(origin);
    }
  });

  return { invalidOrigins, validOrigins };
}

/**
 * Common social authentication error codes
 */
export const SOCIAL_AUTH_ERROR_CODES = {
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  INVALID_SECRET: 'INVALID_SECRET',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type SocialAuthErrorCode = typeof SOCIAL_AUTH_ERROR_CODES[keyof typeof SOCIAL_AUTH_ERROR_CODES];