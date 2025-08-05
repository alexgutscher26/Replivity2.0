/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth-schema";
import {
  AI_MODEL_LIST,
  type AIInstanceConfig,
  PAYMENT_PROVIDERS_LIST,
  type PaymentProviderSettings,
  STORAGE_PROVIDERS_LIST,
  type StorageProviderSettings,
} from "@/utils/schema/settings";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { cache } from "react";
import { UTApi } from "uploadthing/server";
import { PayPalPaymentProvider } from "./payments/paypal";
import { StripePaymentProvider } from "./payments/stripe";
import { type PaymentProvider } from "./payments/types";

export const getSession = cache(async (customHeaders?: Headers) => {
  return await auth.api.getSession({
    headers: customHeaders ?? (await headers()),
  });
});

export const isFirstUser = cache(async (): Promise<boolean> => {
  const users = await db.select().from(user).limit(1);

  return users.length === 0;
});

/**
 * Retrieves an AI instance based on the provided configuration.
 *
 * It selects a model from the enabled models and initializes the corresponding AI provider instance.
 * If no valid model is found or if an unknown provider is specified, it throws an error.
 *
 * @param apiKey - The API key for accessing the AI services.
 * @param enabledModels - An array of model keys that are enabled for use.
 * @returns An object containing the initialized AI instance and the selected model.
 * @throws Error If no AI model is selected or if the provider is unknown.
 */
export const getAIInstance = async ({
  apiKey,
  enabledModels,
}: AIInstanceConfig) => {
  const selectedModel = AI_MODEL_LIST.find((m) =>
    enabledModels.includes(m.key),
  );

  if (!selectedModel) {
    throw new Error("No AI model selected");
  }

  switch (selectedModel.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return {
        instance: openai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "mistralai": {
      const mistralai = createMistral({ apiKey });
      return {
        instance: mistralai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "google": {
      const googleai = createGoogleGenerativeAI({ apiKey });
      return {
        instance: googleai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return {
        instance: anthropic(selectedModel.key),
        model: selectedModel,
      };
    }
    default:
      const provider = (selectedModel as { provider: string }).provider;
      throw new Error(`Unknown provider: ${provider}`);
  }
};

export const getPaymentInstance = async ({
  apiKey,
  clientSecret,
  enabledProviders,
}: PaymentProviderSettings): Promise<{
  instance: PaymentProvider;
  provider: (typeof PAYMENT_PROVIDERS_LIST)[number];
}> => {
  const selectedProvider = PAYMENT_PROVIDERS_LIST.find((p) =>
    enabledProviders.includes(p.key),
  );

  if (!selectedProvider) {
    throw new Error("No payment provider selected");
  }

  switch (selectedProvider.key) {
    case "stripe": {
      return {
        instance: new StripePaymentProvider(apiKey),
        provider: selectedProvider,
      };
    }
    case "paypal": {
      return {
        instance: new PayPalPaymentProvider(apiKey, clientSecret ?? ""),
        provider: selectedProvider,
      };
    }
    default:
      const provider = (selectedProvider as { key: string }).key;
      throw new Error(`Unknown provider: ${provider}`);
  }
};

export const getStorageInstance = async ({
  apiKey,
  enabledProviders,
}: StorageProviderSettings) => {
  const selectedProvider = STORAGE_PROVIDERS_LIST.find((p) =>
    enabledProviders.includes(p.key),
  );

  if (!selectedProvider) {
    throw new Error("No storage provider selected");
  }

  switch (selectedProvider.key) {
    case "ut": {
      const utapi = new UTApi({ token: apiKey });

      return {
        instance: utapi,
        provider: selectedProvider,
      };
    }
    case "vercel": {
      // Add Vercel initialization when implemented
      throw new Error("Vercel integration not implemented yet");
    }
    default:
      const provider = (selectedProvider as { key: string }).key;
      throw new Error(`Unknown provider: ${provider}`);
  }
};
