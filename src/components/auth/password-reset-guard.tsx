"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PasswordResetGuardProps {
  children: React.ReactNode;
}

/**
 * A React component that guards password reset requirements before rendering its children.
 *
 * This component checks if a password reset is required using the `checkPasswordResetRequired` API query.
 * It handles different states such as loading, error, and password reset required scenarios,
 * providing appropriate UI feedback for each case. If no reset is required, it renders its children.
 *
 * @param {PasswordResetGuardProps} props - The props for the PasswordResetGuard component.
 * @returns {JSX.Element} - The JSX element representing the guard or its children based on the password reset status.
 */
export function PasswordResetGuard({ children }: PasswordResetGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [resetRequired, setResetRequired] = useState(false);
  const [resetReason, setResetReason] = useState<string>("");
  const [resetExpiresAt, setResetExpiresAt] = useState<Date | null>(null);

  const {
    data: resetStatus,
    isLoading,
    error,
  } = api.security.checkPasswordResetRequired.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      if (resetStatus) {
        setResetRequired(resetStatus.required);
        setResetReason(resetStatus.reason ?? "");
        setResetExpiresAt(
          resetStatus.expiresAt ? new Date(resetStatus.expiresAt) : null,
        );
      }
    }
  }, [isLoading, resetStatus]);

  /**
   * Redirects to the reset password page with forced reset query parameter.
   */
  const handleGoToReset = () => {
    router.push("/auth/reset-password?forced=true");
  };

  /**
   * Redirects user to the login page after triggering a logout.
   */
  const handleLogout = () => {
    // Trigger logout and redirect to login
    window.location.href = "/auth/signin";
  };

  // Show loading state while checking
  if (isChecking || isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if check failed
  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Security Check Failed</span>
            </CardTitle>
            <CardDescription>
              Unable to verify your security status. Please try again or contact
              support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred"}
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show password reset required screen
  if (resetRequired) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-600">
              <Shield className="h-5 w-5" />
              <span>Password Reset Required</span>
            </CardTitle>
            <CardDescription>
              For your security, you must reset your password before continuing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                {resetReason ||
                  "Your password needs to be reset for security reasons."}
              </AlertDescription>
            </Alert>

            {resetExpiresAt && (
              <div className="text-muted-foreground text-sm">
                <p>
                  <strong>Password expires:</strong>{" "}
                  {resetExpiresAt.toLocaleDateString()} at{" "}
                  {resetExpiresAt.toLocaleTimeString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={handleGoToReset} className="w-full">
                Reset Password Now
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>

            <div className="text-muted-foreground text-center text-xs">
              <p>
                You cannot access the application until your password is reset.
                If you believe this is an error, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No reset required, render children
  return <>{children}</>;
}

// Hook for checking password reset status in components
/**
 * Custom hook to fetch and manage password reset status.
 *
 * This function uses the `api.security.checkPasswordResetRequired.useQuery` to determine if a password reset is required.
 * It returns an object containing the reset status, whether it's loading, any errors encountered, and a refetch function.
 * The reset status includes whether a reset is required, the reason for the reset, and when the reset expires.
 */
export function usePasswordResetStatus() {
  const {
    data: resetStatus,
    isLoading,
    error,
    refetch,
  } = api.security.checkPasswordResetRequired.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    resetRequired: resetStatus?.required ?? false,
    resetReason: resetStatus?.reason,
    resetExpiresAt: resetStatus?.expiresAt
      ? new Date(resetStatus.expiresAt)
      : null,
    isLoading,
    error,
    refetch,
  };
}
