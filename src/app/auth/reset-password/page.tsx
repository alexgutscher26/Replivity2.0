"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { usePasswordResetStatus } from "@/components/auth/password-reset-guard";

const passwordResetSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordResetForm = z.infer<typeof passwordResetSchema>;

/**
 * Component to display the strength of a given password.
 *
 * This component evaluates the password against several criteria and calculates its strength percentage.
 * It then displays the strength level as text and visually with a progress bar.
 * Additionally, it lists each criterion with an icon indicating whether the password meets it.
 *
 * @param {string} password - The password to evaluate.
 * @returns A React component displaying the password strength and criteria status.
 */
function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    {
      label: "Contains uppercase letter",
      test: (p: string) => /[A-Z]/.test(p),
    },
    {
      label: "Contains lowercase letter",
      test: (p: string) => /[a-z]/.test(p),
    },
    { label: "Contains number", test: (p: string) => /\d/.test(p) },
    {
      label: "Contains special character",
      test: (p: string) => /[@$!%*?&]/.test(p),
    },
  ];

  const passedChecks = checks.filter((check) => check.test(password)).length;
  const strength = (passedChecks / checks.length) * 100;

  /**
   * Determines the strength text based on the strength value.
   *
   * This function evaluates the `strength` variable and returns a corresponding string:
   * - "Weak" if the strength is less than 40,
   * - "Medium" if the strength is between 40 (inclusive) and 80 (exclusive),
   * - "Strong" if the strength is 80 or greater.
   */
  const getStrengthText = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Password Strength</span>
        <span
          className={`font-medium ${
            strength < 40
              ? "text-red-500"
              : strength < 80
                ? "text-yellow-500"
                : "text-green-500"
          }`}
        >
          {getStrengthText()}
        </span>
      </div>
      <Progress value={strength} className="h-2" />
      <div className="space-y-1">
        {checks.map((check, index) => {
          const passed = check.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              {passed ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={passed ? "text-green-600" : "text-red-600"}>
                {check.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ResetPasswordPage component for handling password reset functionality.
 *
 * This component renders a form where users can reset their passwords. It checks if the reset is forced and displays an alert if necessary.
 * The form includes fields for the current password, new password, and confirmation of the new password. Users can toggle password visibility.
 * On form submission, it simulates a delay and then completes the password reset mutation. Success or failure messages are displayed using toast notifications.
 *
 * @returns A React component rendering the password reset page UI.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isForced = searchParams.get("forced") === "true";

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetReason, resetExpiresAt } = usePasswordResetStatus();

  const form = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = form.watch("newPassword");

  const completeResetMutation = api.security.completePasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Password reset completed successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to complete password reset");
    },
  });

  /**
   * Handles the submission of the password reset form.
   * Initiates a simulated API call to change the password and updates the reset status.
   * Displays an error message if the password change fails and reverts the submitting state.
   */
  const onSubmit = async (_data: PasswordResetForm) => {
    setIsSubmitting(true);
    try {
      // Here you would typically call your auth provider's password change method
      // For this example, we'll simulate the password change

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // After successful password change, mark reset as completed
      await completeResetMutation.mutateAsync();
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <span>
              {isForced ? "Required Password Reset" : "Reset Password"}
            </span>
          </CardTitle>
          <CardDescription>
            {isForced
              ? "For your security, you must reset your password to continue."
              : "Create a new password for your account."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isForced && resetReason && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>{resetReason}</AlertDescription>
            </Alert>
          )}

          {resetExpiresAt && (
            <div className="text-muted-foreground text-sm">
              <p>
                <strong>Password expires:</strong>{" "}
                {resetExpiresAt.toLocaleDateString()} at{" "}
                {resetExpiresAt.toLocaleTimeString()}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          disabled={isSubmitting}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isSubmitting}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedNewPassword && (
                <PasswordStrengthIndicator password={watchedNewPassword} />
              )}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Form>

          {!isForced && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="text-muted-foreground space-y-1 text-center text-xs">
            <p>
              Your new password must be different from your current password.
            </p>
            {isForced && (
              <p className="font-medium text-amber-600">
                You cannot access the application until your password is reset.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
