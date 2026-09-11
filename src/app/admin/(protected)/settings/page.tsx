import { requireManagerPage } from "@/features/admin/auth/guards";
import { ADMIN_MOBILE_HEADER_OFFSET_CLASS } from "@/components/admin/admin-header-offset";
import { SettingsForm } from "@/features/admin/settings/settings-form";
import { getStoreSettings } from "@/features/admin/settings/queries";

export default async function AdminSettingsPage() {
  await requireManagerPage();
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div className={ADMIN_MOBILE_HEADER_OFFSET_CLASS}>
        <h1 className="text-2xl font-black text-[#25130b]">Settings</h1>
        <p className="mt-1 text-sm text-orange-950/45">
          Business values you can change without a deploy.
        </p>
      </div>

      <SettingsForm
        deliveryFee={Number(settings.deliveryFee)}
        isAcceptingOrders={settings.isAcceptingOrders}
      />
    </div>
  );
}
