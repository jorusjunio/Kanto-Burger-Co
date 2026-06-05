import assert from "node:assert/strict";
import test from "node:test";

import {
  parseAddOns,
  readAvailabilityToggle,
  readProductForm,
  resolveSlug,
} from "./action-helpers";

function formData(values: Record<string, string>) {
  const form = new FormData();

  for (const [key, value] of Object.entries(values)) {
    form.set(key, value);
  }

  return form;
}

function validProductForm(overrides: Record<string, string> = {}) {
  return formData({
    categoryId: "category-1",
    name: "Kanto Burger",
    slug: "",
    description: "Juicy burger with cheese",
    price: "129.00",
    imageUrl: "",
    stockQuantity: "10",
    lowStockThreshold: "3",
    addOns: "",
    ...overrides,
  });
}

test("product form accepts empty, http, and local product asset image URLs", () => {
  assert.equal(readProductForm(validProductForm()).imageUrl, "");
  assert.equal(
    readProductForm(
      validProductForm({ imageUrl: "https://example.com/burger.jpg" }),
    ).imageUrl,
    "https://example.com/burger.jpg",
  );
  assert.equal(
    readProductForm(
      validProductForm({
        imageUrl: "/assets/products/Classic Kanto Burger.png",
      }),
    ).imageUrl,
    "/assets/products/Classic Kanto Burger.png",
  );

  assert.throws(
    () => readProductForm(validProductForm({ imageUrl: "javascript:alert(1)" })),
    /Image URL must be a valid http, https, or \/assets\/products path/,
  );
  assert.throws(
    () =>
      readProductForm(
        validProductForm({
          imageUrl: "/assets/hero/Wide banner.jpg",
        }),
      ),
    /Image URL must be a valid http, https, or \/assets\/products path/,
  );
});

test("add-on parser rejects invalid lines instead of silently dropping them", () => {
  assert.deepEqual(parseAddOns("Extra Cheese | 20 | available"), [
    {
      name: "Extra Cheese",
      price: "20.00",
      isAvailable: true,
    },
  ]);
  assert.deepEqual(parseAddOns("Bacon | 35 | unavailable"), [
    {
      name: "Bacon",
      price: "35.00",
      isAvailable: false,
    },
  ]);

  assert.throws(() => parseAddOns("Mystery Sauce | nope"), /invalid price/);
  assert.throws(() => parseAddOns(" | 10"), /missing a name/);
  assert.throws(() => parseAddOns("Cheese | 10 | maybe"), /availability/);
  assert.throws(() => parseAddOns("Cheese | 10 | available | extra"), /too many/);
});

test("generated slugs must include at least one letter or number", () => {
  assert.equal(resolveSlug("", "Kanto Burger!!"), "kanto-burger");
  assert.equal(resolveSlug("Custom Slug", "Ignored Name"), "custom-slug");
  assert.throws(() => resolveSlug("", "!!!"), /Slug must include/);
});

test("availability toggle only accepts explicit boolean strings", () => {
  assert.deepEqual(
    readAvailabilityToggle(
      formData({ productId: "product-1", isAvailable: "true" }),
    ),
    {
      productId: "product-1",
      isAvailable: true,
    },
  );
  assert.deepEqual(
    readAvailabilityToggle(
      formData({ productId: "product-1", isAvailable: "false" }),
    ),
    {
      productId: "product-1",
      isAvailable: false,
    },
  );

  assert.throws(
    () =>
      readAvailabilityToggle(
        formData({ productId: "product-1", isAvailable: "disable-it" }),
      ),
    /Invalid option/,
  );
});
