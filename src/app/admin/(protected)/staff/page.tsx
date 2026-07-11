import { requireManagerPage } from "@/features/admin/auth/guards";
import { StaffManager } from "@/features/admin/staff/staff-manager";
import { getStaffMembers } from "@/features/admin/staff/queries";
import { isGoogleAuthEnabled } from "@/server/auth/config";

export default async function AdminStaffPage() {
  const session = await requireManagerPage();
  const members = await getStaffMembers();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-black text-[#25130b]">Staff</h1>
        <p className="mt-1 text-sm text-orange-950/45">
          Who can sign in — managers see everything, crew get the kitchen board.
        </p>
      </div>

      {!isGoogleAuthEnabled ? (
        <div className="rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          Google sign-in isn’t configured, so new members added here won’t be
          able to log in yet. Set the Google OAuth env vars to enable it.
        </div>
      ) : null}

      <StaffManager members={members} currentUserId={session.user.id} />
    </div>
  );
}
