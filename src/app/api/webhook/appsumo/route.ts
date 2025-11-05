import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { env } from "@/env.js";
import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { AppsumoWebhookPayload } from "@/server/db/schema/appsumo-license-schema";

/**
 * Verify AppSumo webhook signature
 * AppSumo uses HMAC-SHA256 for webhook verification
 */
function verifyAppsumoWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string,
): boolean {
  try {
    // AppSumo sends signature in format: sha256=<hash>
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", webhookSecret)
      .update(payload, "utf8")
      .digest("hex")}`;

    // Check if signatures have the same length before using timingSafeEqual
    if (signature.length !== expectedSignature.length) {
      return false;
    }

    // Use crypto.timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch (error) {
    console.error("AppSumo signature verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = env.APPSUMO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("AppSumo webhook secret not configured");
      return new Response("Webhook secret not configured", { status: 400 });
    }

    // Get raw payload and signature
    const payload = await request.text();
    const signature = request.headers.get("x-appsumo-signature") ?? "";

    // Parse webhook payload first to check if it's a test request
    const event = JSON.parse(payload) as AppsumoWebhookPayload & {
      test?: boolean;
    };

    // Handle test requests from AppSumo for webhook validation
    if (event.test === true) {
      console.log("Received AppSumo test webhook for validation");
      return NextResponse.json({
        success: true,
        event: event.event || "test",
      });
    }

    // For non-test requests, verify signature
    if (!signature) {
      console.error("Missing AppSumo signature header");
      return new Response("Missing x-appsumo-signature header", {
        status: 400,
      });
    }

    // Verify webhook signature
    const isValid = verifyAppsumoWebhookSignature(
      payload,
      signature,
      webhookSecret,
    );

    if (!isValid) {
      console.error("Invalid AppSumo webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    console.log(
      `Received AppSumo webhook: ${event.event} for license ${event.license_key}`,
    );

    // Process webhook event
    switch (event.event) {
      case "license.activated": {
        try {
          await api.appsumoLicense.activateLicense({
            licenseKey: event.license_key,
            appsumoUserId: event.user_id,
            appsumoEmail: event.email,
            appsumoOrderId: event.order_id,
            appsumoProductId: event.product_id,
            appsumoVariantId: event.variant_id,
            metadata: event.metadata,
          });

          console.log(`License activated: ${event.license_key}`);
        } catch (error) {
          if (error instanceof TRPCError && error.code === "CONFLICT") {
            // License already exists, update it
            await api.appsumoLicense.updateLicenseStatus({
              licenseKey: event.license_key,
              status: "active",
              metadata: event.metadata,
            });
            console.log(`License reactivated: ${event.license_key}`);
          } else {
            throw error;
          }
        }
        break;
      }

      case "license.deactivated": {
        await api.appsumoLicense.updateLicenseStatus({
          licenseKey: event.license_key,
          status: "deactivated",
          metadata: event.metadata,
        });

        console.log(`License deactivated: ${event.license_key}`);
        break;
      }

      case "license.upgraded":
      case "license.downgraded": {
        // Handle plan changes - update the associated product
        await api.appsumoLicense.updateLicenseProduct({
          licenseKey: event.license_key,
          appsumoProductId: event.product_id,
          appsumoVariantId: event.variant_id,
          metadata: event.metadata,
        });

        console.log(`License ${event.event}: ${event.license_key}`);
        break;
      }

      case "license.refunded": {
        await api.appsumoLicense.updateLicenseStatus({
          licenseKey: event.license_key,
          status: "expired",
          metadata: event.metadata,
        });

        console.log(`License refunded: ${event.license_key}`);
        break;
      }

      default:
        console.log(`Unhandled AppSumo event type: ${String(event.event)}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing AppSumo webhook:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Error processing webhook",
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
