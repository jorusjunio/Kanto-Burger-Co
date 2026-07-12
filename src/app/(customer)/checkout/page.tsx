import { CheckoutPage } from "@/features/checkout/checkout-page";
import { getStoreSettings } from "@/features/admin/settings/queries";

// Reads live store settings (delivery fee + accepting-orders toggle), so it must
// render per-request — never served from the static prerender cache.
export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getStoreSettings();

  return (
    <CheckoutPage
      deliveryFee={Number(settings.deliveryFee)}
      acceptingOrders={settings.isAcceptingOrders}
    />
  );
}
