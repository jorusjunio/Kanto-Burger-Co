import type { CartItem } from "@/features/cart/cart-store";

export type CheckoutOrderType = "PICKUP" | "DELIVERY";
export type CheckoutPaymentMethod = "CASH" | "COD" | "GCASH";

export type CheckoutPageProps = {
  gcashNumber?: string;
};

export type CheckoutFormValues = {
  customerName: string;
  customerPhone: string;
  orderType: CheckoutOrderType;
  deliveryAddress: string;
  paymentMethod: CheckoutPaymentMethod;
  gcashReference: string;
  notes: string;
  items: CartItem[];
};

export type CreateOrderResult =
  | {
      ok: true;
      orderNumber: string;
      trackingToken: string;
    }
  | {
      ok: false;
      message: string;
    };
