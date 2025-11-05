"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-auth-hooks";
import { authClient } from "@/server/auth/client";
import {
  type UpdateUserPasswordSettingsFormValues,
  UpdateUserPasswordSettingsSchema,
} from "@/utils/schema/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMemo } from "react";

// Password strength checker component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = useMemo(() => {
    const checks = [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "Contains number",
        met: /\d/.test(password),
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
      {
        label: "No sequential characters (123, abc)",
        met: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(
          password,
        ),
      },
      {
        label: "No repeated characters (aaa, 111)",
        met: !/(.)\1{2,}/.test(password),
      },
    ];

    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "12345678",
      "12345",
      "1234567",
      "password123",
      "admin",
      "qwerty",
      "abc123",
      "Password1",
      "welcome",
      "login",
      "passw0rd",
      "master",
      "hello",
      "guest",
      "root",
      "test",
      "user",
      "default",
      "changeme",
    ];

    checks.push({
      label: "Not a common password",
      met: !commonPasswords.includes(password.toLowerCase()),
    });

    return checks;
  }, [password]);

  const metCount = requirements.filter((req) => req.met).length;
  const strength = metCount / requirements.length;

  const getStrengthColor = () => {
    if (strength < 0.3) return "bg-red-500";
    if (strength < 0.6) return "bg-yellow-500";
    if (strength < 0.8) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength < 0.3) return "Weak";
    if (strength < 0.6) return "Fair";
    if (strength < 0.8) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Password Strength:</span>
          <span
            className={`font-medium ${
              strength < 0.3
                ? "text-red-600"
                : strength < 0.6
                  ? "text-yellow-600"
                  : strength < 0.8
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.met ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-red-500" />
              )}
              <span className={req.met ? "text-green-700" : "text-gray-600"}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UpdateUserPasswordSettingsForm() {
  const { user, isPending, refetch, isError, error } = useSession();

  const form = useForm<UpdateUserPasswordSettingsFormValues>({
    resolver: zodResolver(UpdateUserPasswordSettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      revokeOtherSessions: true,
    },
  });

  async function onSubmit(data: UpdateUserPasswordSettingsFormValues) {
    await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: data.revokeOtherSessions,
      fetchOptions: {
        onError: ({ error }) => {
          toast.error("Uh oh! Something went wrong.", {
            description: error.message ?? "Failed to update password.",
            action: {
              label: "Try again",
              onClick: () => {
                void onSubmit(data);
              },
            },
          });
        },
        onSuccess: async () => {
          toast.success("Success", {
            description: "Your password has been updated.",
          });

          await refetch();
        },
      },
    });
  }

  if (isPending || !user)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (isError)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-red-500">{error?.message}</p>
      </div>
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <h3 className="mb-4 text-lg font-medium">Update Password</h3>
        <div className="space-y-4 rounded-lg border p-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Current Password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your current password.</FormDescription>
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
                  <Input
                    type="password"
                    placeholder="Your New Password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Your new password must meet the security requirements below.
                </FormDescription>
                <PasswordStrengthIndicator password={field.value || ""} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Confirm your new password.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="revokeOtherSessions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Revoke Other Sessions</FormLabel>
                  <FormDescription>
                    Log out of other sessions across all of your devices.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size={"sm"}
            variant={"outline"}
            disabled={
              isPending ||
              form.formState.isSubmitting ||
              !form.formState.isValid ||
              !form.formState.isDirty
            }
          >
            {isPending || form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
