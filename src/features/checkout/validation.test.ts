import assert from "node:assert/strict";
import test from "node:test";

import { validateCreateOrderInput } from "./validation";

const baseOrder = {
  customerName: "Juan Dela Cruz",
  customerPhone: "09171234567",
  orderType: "PICKUP",
  deliveryAddress: "",
  paymentMethod: "CASH",
  gcashReference: "",
  notes: "",
  items: [
    {
      cartKey: "burger-classic",
      productId: "product-1",
      name: "Classic Burger",
      price: 129,
      quantity: 2,
      addOns: [
        {
          id: "cheese",
          name: "Extra Cheese",
          price: 20,
        },
      ],
      notes: "No onions",
    },
  ],
};

test("accepts pickup orders paid with cash", () => {
  const result = validateCreateOrderInput(baseOrder);

  assert.equal(result.ok, true);
  assert.equal(result.ok && result.data.customerName, "Juan Dela Cruz");
});

test("requires a delivery address for delivery orders", () => {
  const result = validateCreateOrderInput({
    ...baseOrder,
    orderType: "DELIVERY",
    paymentMethod: "COD",
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Delivery address is required.",
  });
});

test("rejects COD for pickup orders", () => {
  const result = validateCreateOrderInput({
    ...baseOrder,
    paymentMethod: "COD",
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Cash on delivery is only available for delivery orders.",
  });
});

test("rejects cash at pickup for delivery orders", () => {
  const result = validateCreateOrderInput({
    ...baseOrder,
    orderType: "DELIVERY",
    deliveryAddress: "123 Kanto St.",
    paymentMethod: "CASH",
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Cash at pickup is only available for pickup orders.",
  });
});

test("accepts GCash orders without a manual reference (settled via gateway)", () => {
  const result = validateCreateOrderInput({
    ...baseOrder,
    paymentMethod: "GCASH",
  });

  assert.equal(result.ok, true);
  assert.equal(result.ok && result.data.paymentMethod, "GCASH");
});

test("rejects empty carts", () => {
  const result = validateCreateOrderInput({
    ...baseOrder,
    items: [],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Cart is empty.",
  });
});
