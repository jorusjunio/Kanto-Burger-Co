import { CheckoutPage } from "@/features/checkout/checkout-page";
import { getStoreSettings } from "@/features/admin/settings/queries";

export default async function Page() {
  const settings = await getStoreSettings();

  return (
    <CheckoutPage
      deliveryFee={Number(settings.deliveryFee)}
      acceptingOrders={settings.isAcceptingOrders}
    />
  );
}
