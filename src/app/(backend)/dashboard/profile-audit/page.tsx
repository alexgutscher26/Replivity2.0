import { ProfileAuditTool } from "./_components/profile-audit-tool";

export default function ProfileAuditPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Profile Audit & Suggestions
        </h2>
        <div className="flex items-center space-x-2">
          {/* Additional header actions can go here */}
        </div>
      </div>
      <ProfileAuditTool />
    </div>
  );
}
