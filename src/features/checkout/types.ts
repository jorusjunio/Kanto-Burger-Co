import type { CartItem } from "@/features/cart/cart-store";

export type CheckoutOrderType = "PICKUP" | "DELIVERY";
export type CheckoutPaymentMethod = "CASH" | "COD" | "GCASH";

export type CheckoutFormValues = {
  customerName: string;
  customerPhone: string;
  orderType: CheckoutOrderType;
  deliveryAddress: string;
  paymentMethod: CheckoutPaymentMethod;
  notes: string;
  items: CartItem[];
};

export type CreateOrderResult =
  | {
      ok: true;
      orderNumber: string;
      trackingToken: string;
      /** Present for online (gateway) orders — client redirects here to pay. */
      redirectUrl?: string;
    }
  | {
      ok: false;
      message: string;
    };
