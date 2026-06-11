import { CheckoutPage } from "@/features/checkout/checkout-page";

export default function Page() {
  return <CheckoutPage gcashNumber={process.env.GCASH_NUMBER} />;
}
