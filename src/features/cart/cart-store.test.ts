import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";

import type { CartItem } from "./cart-store";

const storage = new Map<string, string>();

const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  configurable: true,
});

let useCartStore: typeof import("./cart-store").useCartStore;

before(async () => {
  ({ useCartStore } = await import("./cart-store"));
});

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    cartKey: "classic-burger",
    productId: "product-1",
    name: "Classic Burger",
    price: 129,
    quantity: 1,
    maxQuantity: 5,
    addOns: [],
    ...overrides,
  };
}

beforeEach(() => {
  storage.clear();
  useCartStore.setState({ items: [] });
});

test("adds new cart items", () => {
  const item = makeCartItem();

  useCartStore.getState().addItem(item);

  assert.deepEqual(useCartStore.getState().items, [item]);
});

test("merges matching cart keys and caps at tracked stock", () => {
  const store = useCartStore.getState();

  store.addItem(makeCartItem({ quantity: 3, maxQuantity: 4 }));
  useCartStore.getState().addItem(makeCartItem({ quantity: 3, maxQuantity: 4 }));

  assert.equal(useCartStore.getState().items[0]?.quantity, 4);
});

test("keeps quantity updates between one and tracked stock", () => {
  const store = useCartStore.getState();

  store.addItem(makeCartItem({ quantity: 2, maxQuantity: 3 }));

  useCartStore.getState().updateQuantity("classic-burger", 0);
  assert.equal(useCartStore.getState().items[0]?.quantity, 1);

  useCartStore.getState().updateQuantity("classic-burger", 10);
  assert.equal(useCartStore.getState().items[0]?.quantity, 3);
});

test("removes items by cart key", () => {
  const store = useCartStore.getState();

  store.addItem(makeCartItem());
  store.addItem(
    makeCartItem({
      cartKey: "fries",
      productId: "product-2",
      name: "Fries",
    }),
  );

  useCartStore.getState().removeItem("classic-burger");

  assert.deepEqual(
    useCartStore.getState().items.map((item) => item.cartKey),
    ["fries"],
  );
});

test("calculates subtotal with add-ons", () => {
  const store = useCartStore.getState();

  store.addItem(
    makeCartItem({
      quantity: 2,
      addOns: [
        {
          id: "cheese",
          name: "Extra Cheese",
          price: 20,
        },
      ],
    }),
  );

  assert.equal(useCartStore.getState().subtotal(), 298);
});

