import { ActiveSessionUserCardSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/active-session-user-card-settings";
import { DeleteAccountCardSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/delete-account-card-settings";
import { OtherSessionsUserCardSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/other-sessions-user-card-settings";
import { TwoFactorAuthSettings } from "@/app/(backend)/dashboard/settings/profile/_components/two-factor-auth-settings";
import { UpdateUserEmailSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/update-user-email-settings";
import { UpdateUserPasswordSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/update-user-password-settings";
import { UpdateUserProfileSettingsForm } from "@/app/(backend)/dashboard/settings/profile/_components/update-user-profile-settings-form";

import { Separator } from "@/components/ui/separator";

/**
 * Renders a profile settings page with various user setting forms.
 */
export default async function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-muted-foreground text-sm">
          Update your profile information.
        </p>
      </div>
      <Separator />
      <UpdateUserProfileSettingsForm />

      <UpdateUserEmailSettingsForm />
      <UpdateUserPasswordSettingsForm />
      <TwoFactorAuthSettings />
      <ActiveSessionUserCardSettingsForm />
      <OtherSessionsUserCardSettingsForm />
      <DeleteAccountCardSettingsForm />
    </div>
  );
}
