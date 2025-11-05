import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // AppSumo Integration
    APPSUMO_CLIENT_ID: z.string().optional(),
    APPSUMO_CLIENT_SECRET: z.string().optional(),
    APPSUMO_WEBHOOK_SECRET: z
      .string()
      .min(1, "AppSumo webhook secret is required")
      .optional(),
    APPSUMO_API_BASE_URL: z.string().url().default("https://api.appsumo.com"),
  },

  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    // AppSumo Integration
    APPSUMO_CLIENT_ID: process.env.APPSUMO_CLIENT_ID,
    APPSUMO_CLIENT_SECRET: process.env.APPSUMO_CLIENT_SECRET,
    APPSUMO_WEBHOOK_SECRET: process.env.APPSUMO_WEBHOOK_SECRET,
    APPSUMO_API_BASE_URL: process.env.APPSUMO_API_BASE_URL,
  },

  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
  emptyStringAsUndefined: true,
});
