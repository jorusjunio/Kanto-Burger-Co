import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

import { createOrder } from "./actions";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

describe("Checkout Concurrency Tests", () => {
  before(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.addOn.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  it("should handle concurrent checkout attempts for the same product correctly", async () => {
    // Create a test product with limited stock
    const category = await prisma.category.create({
      data: {
        name: "Test Category",
        slug: "test-category",
        sortOrder: 1,
      },
    });

    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: "Test Product",
        slug: "test-product",
        description: "Test description",
        price: "100.00",
        stockQuantity: 5,
        lowStockThreshold: 2,
        trackStock: true,
        isAvailable: true,
      },
    });

    // Simulate 3 concurrent checkout attempts for 3 items each
    const checkoutPromises = Array.from({ length: 3 }, async (_, i) => {
      const orderInput = {
        customerName: `Customer ${i}`,
        customerPhone: `0917123456${i}`,
        orderType: "PICKUP" as const,
        deliveryAddress: "",
        paymentMethod: "CASH" as const,
        gcashReference: "",
        notes: "",
        items: [
          {
            cartKey: `test-${i}`,
            productId: product.id,
            name: product.name,
            price: 100,
            imageUrl: null,
            quantity: 3,
            addOns: [],
            notes: "",
          },
        ],
      };

      return createOrder(orderInput);
    });

    const results = await Promise.all(checkoutPromises);

    // Count successful orders
    const successfulOrders = results.filter((r) => r.ok).length;
    const failedOrders = results.filter((r) => !r.ok).length;

    // With 5 stock and 3 items per order, only 1 order should succeed
    assert.strictEqual(successfulOrders, 1, "Only one order should succeed due to stock limits");
    assert.strictEqual(failedOrders, 2, "Two orders should fail due to insufficient stock");

    // Verify final stock is correct
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
    });

    assert.strictEqual(updatedProduct?.stockQuantity, 2, "Stock should be reduced by 3");
  });

  it("should handle concurrent checkout attempts for different products correctly", async () => {
    // Create test products
    const category = await prisma.category.create({
      data: {
        name: "Test Category 2",
        slug: "test-category-2",
        sortOrder: 1,
      },
    });

    const product1 = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: "Test Product 1",
        slug: "test-product-1",
        description: "Test description",
        price: "100.00",
        stockQuantity: 3,
        lowStockThreshold: 1,
        trackStock: true,
        isAvailable: true,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: "Test Product 2",
        slug: "test-product-2",
        description: "Test description",
        price: "150.00",
        stockQuantity: 3,
        lowStockThreshold: 1,
        trackStock: true,
        isAvailable: true,
      },
    });

    // Concurrent checkouts for different products
    const checkoutPromises = [
      createOrder({
        customerName: "Customer 1",
        customerPhone: "09171234561",
        orderType: "PICKUP",
        deliveryAddress: "",
        paymentMethod: "CASH",
        gcashReference: "",
        notes: "",
        items: [
          {
            cartKey: "test-1",
            productId: product1.id,
            name: product1.name,
            price: 100,
            imageUrl: null,
            quantity: 2,
            addOns: [],
            notes: "",
          },
        ],
      }),
      createOrder({
        customerName: "Customer 2",
        customerPhone: "09171234562",
        orderType: "PICKUP",
        deliveryAddress: "",
        paymentMethod: "CASH",
        gcashReference: "",
        notes: "",
        items: [
          {
            cartKey: "test-2",
            productId: product2.id,
            name: product2.name,
            price: 150,
            imageUrl: null,
            quantity: 2,
            addOns: [],
            notes: "",
          },
        ],
      }),
    ];

    const results = await Promise.all(checkoutPromises);

    // Both should succeed since they're different products
    const successfulOrders = results.filter((r) => r.ok).length;
    assert.strictEqual(successfulOrders, 2, "Both orders should succeed for different products");

    // Verify stock is correct for both products
    const updatedProduct1 = await prisma.product.findUnique({
      where: { id: product1.id },
    });

    const updatedProduct2 = await prisma.product.findUnique({
      where: { id: product2.id },
    });

    assert.strictEqual(updatedProduct1?.stockQuantity, 1, "Product 1 stock should be reduced by 2");
    assert.strictEqual(updatedProduct2?.stockQuantity, 1, "Product 2 stock should be reduced by 2");
  });
});
