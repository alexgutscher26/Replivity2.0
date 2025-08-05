import { getBaseUrl } from "@/utils";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    adminClient(), 
    twoFactorClient({
      onTwoFactorRedirect() {
        // Redirect to two-factor verification page
        window.location.href = "/auth/two-factor";
      }
    })
  ],
});
