import { z } from "zod";

const cartAddOnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const cartItemSchema = z.object({
  cartKey: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  imageUrl: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
  addOns: z.array(cartAddOnSchema),
  notes: z.string().optional(),
});

export const createOrderSchema = z
  .object({
    customerName: z.string().trim().min(2, "Name is required."),
    customerPhone: z.string().trim().min(7, "Phone number is required."),
    orderType: z.enum(["PICKUP", "DELIVERY"]),
    deliveryAddress: z.string().trim(),
    paymentMethod: z.enum(["CASH", "COD", "GCASH"]),
    notes: z.string().trim(),
    items: z.array(cartItemSchema).min(1, "Cart is empty."),
  })
  .superRefine((value, context) => {
    if (value.orderType === "DELIVERY" && !value.deliveryAddress) {
      context.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Delivery address is required.",
      });
    }

    if (value.orderType === "PICKUP" && value.paymentMethod === "COD") {
      context.addIssue({
        code: "custom",
        path: ["paymentMethod"],
        message: "Cash on delivery is only available for delivery orders.",
      });
    }

    if (value.orderType === "DELIVERY" && value.paymentMethod === "CASH") {
      context.addIssue({
        code: "custom",
        path: ["paymentMethod"],
        message: "Cash at pickup is only available for pickup orders.",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export function validateCreateOrderInput(input: unknown):
  | {
      ok: true;
      data: CreateOrderInput;
    }
  | {
      ok: false;
      message: string;
    } {
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
    };
  }

  return { ok: true, data: parsed.data };
}
