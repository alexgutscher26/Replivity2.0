"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/auth/client";
import { useSession } from "@/hooks/use-auth-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Key } from "lucide-react";

// Types
type VerificationMethod = "totp" | "backup";

interface VerificationState {
  code: string;
  isLoading: boolean;
  error: string;
  method: VerificationMethod;
}

// Constants
const TOTP_CODE_LENGTH = 6;
const BACKUP_CODE_MAX_LENGTH = 10;

// Validation functions
/**
 * Validates if the provided TOTP code is a six-digit number.
 */
const validateTotpCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Validates if the provided backup code is between 8 and 10 alphanumeric characters long.
 */
const validateBackupCode = (code: string): boolean => {
  return /^[a-zA-Z0-9]{8,10}$/.test(code);
};

/**
 * Sanitizes TOTP input by removing non-digit characters and limiting length.
 */
const sanitizeTotpInput = (input: string): string => {
  return input.replace(/\D/g, "").slice(0, TOTP_CODE_LENGTH);
};

/**
 * Sanitizes backup input by removing non-alphanumeric characters and converting to lowercase.
 */
const sanitizeBackupInput = (input: string): string => {
  return input
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, BACKUP_CODE_MAX_LENGTH);
};

/**
 * TwoFactorPage component for handling two-factor authentication verification.
 *
 * This component manages the state of the verification process, including the input code,
 * loading status, and error messages. It supports both TOTP (Time-based One-Time Password)
 * and backup code verification methods. The component uses hooks like `useState` and
 * `useMemo` for efficient state management and memoization. Event handlers handle user
 * interactions such as input changes and method toggles. The form submission is validated,
 * and appropriate API calls are made based on the selected verification method.
 *
 * @returns A React functional component rendering the two-factor authentication page.
 */
export default function TwoFactorPage() {
  const [state, setState] = useState<VerificationState>({
    code: "",
    isLoading: false,
    error: "",
    method: "totp",
  });

  const router = useRouter();
  const { refetch } = useSession();

  // Memoized values
  const isBackupMethod = useMemo(
    () => state.method === "backup",
    [state.method],
  );

  const isSubmitDisabled = useMemo(() => {
    if (state.isLoading) return true;
    if (isBackupMethod) {
      return !validateBackupCode(state.code);
    }
    return !validateTotpCode(state.code);
  }, [state.isLoading, state.code, isBackupMethod]);

  const inputConfig = useMemo(
    () => ({
      placeholder: isBackupMethod ? "Enter backup code" : "000000",
      maxLength: isBackupMethod ? BACKUP_CODE_MAX_LENGTH : TOTP_CODE_LENGTH,
      className: isBackupMethod
        ? "text-center text-lg font-mono"
        : "text-center text-lg tracking-widest font-mono",
      "aria-label": isBackupMethod
        ? "Enter your backup code"
        : "Enter your 6-digit verification code",
    }),
    [isBackupMethod],
  );

  // Event handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = isBackupMethod
        ? sanitizeBackupInput(rawValue)
        : sanitizeTotpInput(rawValue);

      setState((prev) => ({
        ...prev,
        code: sanitizedValue,
        error: "", // Clear error on input change
      }));
    },
    [isBackupMethod],
  );

  const handleMethodToggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      method: prev.method === "totp" ? "backup" : "totp",
      code: "",
      error: "",
    }));
  }, []);

  const handleVerification = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate input before submission
      const isValid = isBackupMethod
        ? validateBackupCode(state.code)
        : validateTotpCode(state.code);

      if (!isValid) {
        setState((prev) => ({
          ...prev,
          error: isBackupMethod
            ? "Please enter a valid backup code (8-10 characters)"
            : "Please enter a valid 6-digit code",
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: "" }));

      try {
        const result = isBackupMethod
          ? await authClient.twoFactor.verifyBackupCode({ code: state.code })
          : await authClient.twoFactor.verifyTotp({
              code: state.code,
              trustDevice: true,
            });

        if (result) {
          await refetch();
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Invalid ${isBackupMethod ? "backup code" : "verification code"}. Please try again.`;

        setState((prev) => ({ ...prev, error: errorMessage }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.code, isBackupMethod, refetch, router],
  );

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card className="w-full">
          <CardHeader className="space-y-4 text-center">
            <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              {isBackupMethod ? (
                <Key
                  className="text-muted-foreground h-6 w-6"
                  aria-hidden="true"
                />
              ) : (
                <Shield
                  className="text-muted-foreground h-6 w-6"
                  aria-hidden="true"
                />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              {isBackupMethod
                ? "Enter one of your backup codes to complete sign-in"
                : "Enter the 6-digit code from your authenticator app to complete sign-in"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleVerification}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-2">
                <Label
                  htmlFor="verification-code"
                  className="text-sm font-medium"
                >
                  {isBackupMethod ? "Backup Code" : "Verification Code"}
                </Label>
                <Input
                  id="verification-code"
                  name="verification-code"
                  type="text"
                  inputMode={isBackupMethod ? "text" : "numeric"}
                  placeholder={inputConfig.placeholder}
                  value={state.code}
                  onChange={handleInputChange}
                  maxLength={inputConfig.maxLength}
                  className={`${inputConfig.className} ${state.error ? "border-destructive focus:border-destructive" : ""}`}
                  required
                  autoComplete="one-time-code"
                  aria-label={inputConfig["aria-label"]}
                  aria-invalid={Boolean(state.error)}
                  aria-describedby={state.error ? "error-message" : undefined}
                  disabled={state.isLoading}
                />
                {!isBackupMethod && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Enter the 6-digit code from your authenticator app
                  </p>
                )}
              </div>

              {state.error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription id="error-message">
                    {state.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitDisabled}
                aria-describedby="submit-button-description"
              >
                {state.isLoading ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>
                    {isBackupMethod ? "Verify Backup Code" : "Verify Code"}
                  </span>
                )}
              </Button>
              <p id="submit-button-description" className="sr-only">
                {isBackupMethod
                  ? "Submit your backup code for verification"
                  : "Submit your 6-digit verification code"}
              </p>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <Button
                variant="link"
                onClick={handleMethodToggle}
                className="text-sm font-medium"
                disabled={state.isLoading}
                aria-describedby="method-toggle-description"
              >
                {isBackupMethod
                  ? "Use authenticator app instead"
                  : "Use backup code instead"}
              </Button>
              <p id="method-toggle-description" className="sr-only">
                Switch between authenticator app and backup code verification
                methods
              </p>

              <div className="border-border border-t pt-2">
                <Button
                  variant="link"
                  onClick={() => router.push("/auth")}
                  className="text-muted-foreground hover:text-foreground text-sm"
                  disabled={state.isLoading}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
