import { api } from "@/trpc/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema/auth-schema";
import { env } from "@/env.js";
import { getBaseUrl } from "@/utils";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import type { AppsumoOAuthUserInfo } from "@/server/db/schema/appsumo-license-schema";

/**
 * AppSumo OAuth callback handler
 * Handles the OAuth flow when users are redirected from AppSumo
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("AppSumo OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error)}`, getBaseUrl()),
    );
  }

  // Validate required parameters
  if (!code) {
    console.error("Missing authorization code from AppSumo");
    return NextResponse.redirect(
      new URL("/auth/error?error=missing_code", getBaseUrl()),
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    if (!tokenResponse.access_token) {
      throw new Error("Failed to obtain access token");
    }

    // Fetch user information from AppSumo
    const userInfo = await fetchAppsumoUserInfo(tokenResponse.access_token);

    // Check if user already exists in our system
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, userInfo.email),
    });

    if (existingUser) {
      // User exists - link the license and redirect to sign-in
      if (userInfo.license_key) {
        await api.appsumoLicense.adminLinkLicenseToUser({
          licenseKey: userInfo.license_key,
          userId: existingUser.id,
        });
      }

      // Redirect to sign-in page with success message
      const signInUrl = new URL("/auth/sign-in", getBaseUrl());
      signInUrl.searchParams.set("email", existingUser.email);
      signInUrl.searchParams.set(
        "message",
        "AppSumo license linked successfully! Please sign in to continue.",
      );

      return NextResponse.redirect(signInUrl);
    } else {
      // New user - redirect to registration with pre-filled data
      const registrationUrl = new URL("/auth/register", getBaseUrl());
      registrationUrl.searchParams.set("email", userInfo.email);
      if (userInfo.first_name) {
        registrationUrl.searchParams.set("firstName", userInfo.first_name);
      }
      if (userInfo.last_name) {
        registrationUrl.searchParams.set("lastName", userInfo.last_name);
      }
      if (userInfo.license_key) {
        registrationUrl.searchParams.set("licenseKey", userInfo.license_key);
      }

      return NextResponse.redirect(registrationUrl);
    }
  } catch (error) {
    console.error("Error processing AppSumo OAuth callback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(errorMessage)}`,
        getBaseUrl(),
      ),
    );
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string) {
  const clientId = env.APPSUMO_CLIENT_ID;
  const clientSecret = env.APPSUMO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AppSumo OAuth settings not configured");
  }

  const tokenUrl = "https://api.appsumo.com/oauth/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: `${getBaseUrl()}/api/auth/appsumo/callback`,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  }>;
}

/**
 * Fetch user information from AppSumo API
 */
async function fetchAppsumoUserInfo(
  accessToken: string,
): Promise<AppsumoOAuthUserInfo> {
  const userInfoUrl = "https://api.appsumo.com/v1/user";

  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`User info fetch failed: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<AppsumoOAuthUserInfo>;
}
