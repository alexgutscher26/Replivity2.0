/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-auth-hooks";
import { authClient } from "@/server/auth/client";
import { toast } from "sonner";
import { Shield, ShieldCheck, QrCode, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/**
 * Two-Factor Authentication Settings component.
 *
 * This component handles the enabling, disabling, and managing of two-factor authentication (2FA) settings for a user.
 * It manages various UI states such as showing dialogs, handling verification codes, and copying backup codes.
 * The component interacts with an authentication client to perform 2FA enable and disable operations, and it provides feedback
 * through toast notifications for success or error messages.
 *
 * @returns A React functional component that renders the 2FA settings interface.
 */
export function TwoFactorAuthSettings() {
  const { user, refetch } = useSession();
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [totpUri, setTotpUri] = useState<string>("");

  const [verificationCode, setVerificationCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"enable" | "disable">(
    "enable",
  );
  const [password, setPassword] = useState<string>("");

  /**
   * Handles enabling 2FA by setting password action and showing dialog.
   */
  const handleEnable2FA = async () => {
    setPasswordAction("enable");
    setShowPasswordDialog(true);
  };

  /**
   * Handle the confirmation and enabling of two-factor authentication (2FA).
   *
   * This function first checks if a password is provided. If not, it displays an error toast and returns early.
   * It then attempts to enable 2FA by calling the `authClient.twoFactor.enable` method with the provided password.
   * Upon successful response, it sets the TOTP URI and backup codes, and shows the setup dialog.
   * In case of unexpected response format or errors during the process, appropriate error messages are logged
   * and displayed using toast notifications. Finally, it resets the enabling state and clears the password input.
   *
   * @returns None
   */
  const handleConfirmEnable2FA = async () => {
    if (!password) {
      toast.error("Password required", {
        description: "Please enter your password to enable 2FA.",
      });
      return;
    }

    try {
      setIsEnabling(true);
      setShowPasswordDialog(false);

      console.log(
        "Attempting to enable 2FA with password length:",
        password.length,
      );

      const response = await authClient.twoFactor.enable({
        password: password,
      });

      console.log("2FA enable response:", response);

      if (response && "data" in response && response.data) {
        setTotpUri(response.data.totpURI);
        setBackupCodes(response.data.backupCodes ?? []);
        setShowSetupDialog(true);
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Unexpected response format", {
          description: "The server returned an unexpected response.",
        });
      }
    } catch (error) {
      console.error("2FA enable error details:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        response: (error as any)?.response,
        status: (error as any)?.status,
        statusText: (error as any)?.statusText,
        data: (error as any)?.data,
      });

      let errorMessage = "Please check your password and try again.";

      if ((error as any)?.status === 400) {
        errorMessage =
          "Bad request - please check your password and ensure you're logged in.";
      } else if ((error as any)?.status === 401) {
        errorMessage = "Invalid password or session expired.";
      } else if ((error as any)?.status === 403) {
        errorMessage = "Access denied - insufficient permissions.";
      }

      toast.error("Failed to enable 2FA", {
        description: errorMessage,
      });
    } finally {
      setIsEnabling(false);
      setPassword("");
    }
  };

  /**
   * Handles the verification and completion of two-factor authentication setup.
   *
   * It first checks if the verification code is valid (6 digits). If not, it displays an error message.
   * Then, it sends the verification code to the authClient for validation. Upon success, it shows a success message,
   * hides the setup dialog, and sets up backup codes. On failure, it logs the error and displays an error message.
   *
   * @returns void
   */
  const handleVerifyAndComplete = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Invalid code", {
        description: "Please enter a 6-digit code from your authenticator app.",
      });
      return;
    }

    try {
      const response = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (response && "data" in response && response.data) {
        toast.success("2FA enabled successfully!", {
          description:
            "Your account is now protected with two-factor authentication.",
        });
        setShowSetupDialog(false);
        setShowBackupCodes(true);
        await refetch();
      }
    } catch (error) {
      console.error(
        "2FA verify error:",
        error instanceof Error ? error.message : String(error),
      );
      toast.error("Invalid verification code", {
        description: "Please check your authenticator app and try again.",
      });
    }
  };

  /**
   * Sets password action to 'disable' and shows the password dialog.
   */
  const handleDisable2FA = async () => {
    setPasswordAction("disable");
    setShowPasswordDialog(true);
  };

  /**
   * Handles the confirmation of disabling two-factor authentication (2FA).
   *
   * This function checks if a password is provided, then attempts to disable 2FA using the authClient.
   * It updates the UI state during the process and provides feedback through toast notifications.
   * If an error occurs, it logs the error and informs the user of the failure.
   */
  const handleConfirmDisable2FA = async () => {
    if (!password) {
      toast.error("Password required", {
        description: "Please enter your password to disable 2FA.",
      });
      return;
    }

    try {
      setIsDisabling(true);
      setShowPasswordDialog(false);
      await authClient.twoFactor.disable({
        password: password,
      });
      toast.success("2FA disabled", {
        description:
          "Two-factor authentication has been disabled for your account.",
      });
      await refetch();
    } catch (error) {
      console.error(
        "2FA disable error:",
        error instanceof Error ? error.message : String(error),
      );
      toast.error("Failed to disable 2FA", {
        description: "Please check your password and try again.",
      });
    } finally {
      setIsDisabling(false);
      setPassword("");
    }
  };

  /**
   * Copies the provided text to the clipboard and displays a success message.
   * If successful, it sets the copied code ID and resets it after 2 seconds.
   * Handles errors by logging them and displaying an error message.
   *
   * @param text - The text to be copied to the clipboard.
   * @param codeId - Optional identifier for the copied code, used to track which code was copied.
   */
  const copyToClipboard = async (text: string, codeId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId ?? null);
      void setTimeout(() => setCopiedCode(null), 2000);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error(
        "Clipboard error:",
        error instanceof Error ? error.message : String(error),
      );
      toast.error("Failed to copy to clipboard");
    }
  };

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate QR code when totpUri changes
  useEffect(() => {
    if (totpUri) {
      QRCode.toDataURL(totpUri, {
        width: 192,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setQrCodeDataUrl("");
        });
    }
  }, [totpUri]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {user?.twoFactorEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-gray-500" />
            )}
            Two-Factor Authentication
            {user?.twoFactorEnabled && (
              <Badge variant="secondary" className="ml-2">
                Enabled
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {user?.twoFactorEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your account with two-factor authentication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.twoFactorEnabled ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Two-factor authentication is currently enabled for your account.
                You&apos;ll need to enter a code from your authenticator app
                when signing in.
              </p>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={isDisabling}
              >
                {isDisabling ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Two-factor authentication adds an extra layer of security to
                your account by requiring a code from your authenticator app in
                addition to your password.
              </p>
              <Button
                onClick={handleEnable2FA}
                disabled={isEnabling}
                className="w-full sm:w-auto"
              >
                {isEnabling ? "Setting up..." : "Enable 2FA"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Set up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app or enter the secret
              manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* QR Code */}
            {totpUri && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-lg border bg-white p-4">
                  {qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="2FA QR Code"
                      width={192}
                      height={192}
                      className="h-48 w-48"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded bg-gray-100">
                      <span className="text-gray-500">
                        Generating QR code...
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  Scan this QR code with Google Authenticator, Authy, or any
                  compatible TOTP app.
                </p>
              </div>
            )}

            {/* Verification */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Enter the 6-digit code from your authenticator app:
              </Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                placeholder="123456"
                className="text-center font-mono text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerifyAndComplete}
              className="w-full"
              disabled={verificationCode.length !== 6}
            >
              Verify and Enable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              Store these backup codes in a safe place. You can use them to
              access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted space-y-2 rounded-lg p-4">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between">
                  <code className="font-mono text-sm">{code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code, code)}
                  >
                    {copiedCode === code ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Each backup code can only be used once. Make sure to save them
              securely.
            </p>
            <Button
              onClick={() => setShowBackupCodes(false)}
              className="w-full"
            >
              I&apos;ve Saved My Backup Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {passwordAction === "enable" ? "Enable" : "Disable"} Two-Factor
              Authentication
            </DialogTitle>
            <DialogDescription>
              Please enter your password to{" "}
              {passwordAction === "enable" ? "enable" : "disable"} two-factor
              authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-input">Password</Label>
              <Input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    if (passwordAction === "enable") {
                      await handleConfirmEnable2FA();
                    } else {
                      await handleConfirmDisable2FA();
                    }
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  passwordAction === "enable"
                    ? handleConfirmEnable2FA
                    : handleConfirmDisable2FA
                }
                disabled={
                  !password ||
                  (passwordAction === "enable" ? isEnabling : isDisabling)
                }
                className="flex-1"
              >
                {passwordAction === "enable"
                  ? isEnabling
                    ? "Enabling..."
                    : "Enable 2FA"
                  : isDisabling
                    ? "Disabling..."
                    : "Disable 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
