/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { configStore } from "@/server/auth/config-store";
import { getAuthSettingsFromDB } from "@/server/auth/creds";
import { db } from "@/server/db";
import { isFirstUser } from "@/server/utils";
import { type SocialProvider } from "@daveyplate/better-auth-ui";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";

// Initialize auth settings before creating the auth instance
await getAuthSettingsFromDB();

// Helper to create provider config with validation
const createProviderConfig = (provider: SocialProvider) => ({
  get clientId() {
    const credentials = configStore.getProviderCredentials(provider);
    if (!credentials.clientId) {
      console.warn(`Missing clientId for social provider: ${provider}`);
      return "";
    }
    return credentials.clientId;
  },
  get clientSecret() {
    const credentials = configStore.getProviderCredentials(provider);
    if (!credentials.clientSecret) {
      console.warn(`Missing clientSecret for social provider: ${provider}`);
      return "";
    }
    return credentials.clientSecret;
  },
});

// Get enabled providers with validation
const enabledProviders = configStore.getEnabledProviders();

// Filter out providers with missing credentials
const validProviders = enabledProviders.filter((provider) => {
  const credentials = configStore.getProviderCredentials(provider);
  const isValid = credentials.clientId && credentials.clientSecret;
  if (!isValid) {
    console.warn(`Skipping social provider '${provider}' due to missing credentials`);
  }
  return isValid;
});

// Create social providers config object dynamically
const socialProvidersConfig = Object.fromEntries(
  validProviders.map((provider) => [
    provider,
    createProviderConfig(provider),
  ]),
);



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    nextCookies(),
    admin(),
    twoFactor({
      issuer: "AI Social Replier",
      skipVerificationOnEnable: true,
    }),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
  },
  get trustedOrigins() {
    return configStore.getTrustedOrigins();
  },
  get secret() {
    return configStore.getSecret();
  },
  socialProviders: socialProvidersConfig,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Type assertion to handle custom source property
          const userWithSource = user as typeof user & { source?: string };
          const { source, ...userData } = userWithSource;

          if (source === "dashboard") {
            return { data: { ...userData, banned: false } };
          }

          return {
            data: {
              ...userData,
              role: (await isFirstUser()) ? "admin" : "user",
              banned: false,
            },
          };
        },
      },
    },
  },
});
