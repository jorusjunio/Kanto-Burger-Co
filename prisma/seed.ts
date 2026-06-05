import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Burgers", slug: "burgers", sortOrder: 1 },
  { name: "Chicken Sandwiches", slug: "chicken-sandwiches", sortOrder: 2 },
  { name: "Fries & Sides", slug: "fries-and-sides", sortOrder: 3 },
  { name: "Snacks", slug: "snacks", sortOrder: 4 },
  { name: "Drinks", slug: "drinks", sortOrder: 5 },
  { name: "Combos", slug: "combos", sortOrder: 6 },
];

const products = [
  {
    categorySlug: "burgers",
    name: "Classic Kanto Burger",
    slug: "classic-kanto-burger",
    description: "Beef patty, cheese, lettuce, tomato, onion, and house sauce.",
    price: "99.00",
    imageUrl: "/assets/products/Classic Kanto Burger.png",
    stockQuantity: 35,
    lowStockThreshold: 8,
    isFeatured: true,
    addOns: [
      { name: "Extra Cheese", price: "20.00" },
      { name: "Extra Patty", price: "55.00" },
      { name: "Bacon Strips", price: "45.00" },
    ],
  },
  {
    categorySlug: "burgers",
    name: "Double Cheese Smash",
    slug: "double-cheese-smash",
    description: "Two smashed patties, double cheese, pickles, and burger sauce.",
    price: "169.00",
    imageUrl: "/assets/products/Double Cheese Smash.png",
    stockQuantity: 20,
    lowStockThreshold: 5,
    isFeatured: true,
    addOns: [
      { name: "Extra Cheese", price: "20.00" },
      { name: "Extra Patty", price: "55.00" },
      { name: "Jalapenos", price: "25.00" },
    ],
  },
  {
    categorySlug: "burgers",
    name: "BBQ Bacon Burger",
    slug: "bbq-bacon-burger",
    description: "Beef patty, bacon, cheddar, caramelized onions, and smoky BBQ sauce.",
    price: "159.00",
    imageUrl: "/assets/products/BBQ Bacon Burger.png",
    stockQuantity: 18,
    lowStockThreshold: 5,
    isFeatured: true,
    addOns: [
      { name: "Extra Bacon", price: "45.00" },
      { name: "Extra BBQ Sauce", price: "15.00" },
    ],
  },
  {
    categorySlug: "chicken-sandwiches",
    name: "Crispy Chicken Sandwich",
    slug: "crispy-chicken-sandwich",
    description: "Crispy chicken fillet, slaw, pickles, and garlic mayo.",
    price: "129.00",
    imageUrl: "/assets/products/Crispy Chicken Sandwich.jpg",
    stockQuantity: 24,
    lowStockThreshold: 6,
    addOns: [
      { name: "Spicy Glaze", price: "20.00" },
      { name: "Extra Slaw", price: "20.00" },
    ],
  },
  {
    categorySlug: "fries-and-sides",
    name: "Loaded Cheese Fries",
    slug: "loaded-cheese-fries",
    description: "Crispy fries topped with cheese sauce, bacon bits, and scallions.",
    price: "119.00",
    imageUrl: "/assets/products/Loaded Cheese Fries.png",
    stockQuantity: 30,
    lowStockThreshold: 8,
    isFeatured: true,
    addOns: [
      { name: "Extra Cheese Sauce", price: "25.00" },
      { name: "Extra Bacon Bits", price: "35.00" },
    ],
  },
  {
    categorySlug: "fries-and-sides",
    name: "Kanto Fries",
    slug: "kanto-fries",
    description: "Golden fries with house seasoning.",
    price: "69.00",
    imageUrl: "/assets/products/Fries.png",
    stockQuantity: 45,
    lowStockThreshold: 10,
    addOns: [
      { name: "Cheese Dip", price: "20.00" },
      { name: "Garlic Mayo", price: "15.00" },
    ],
  },
  {
    categorySlug: "snacks",
    name: "Chicken Nuggets",
    slug: "chicken-nuggets",
    description: "Six-piece crispy nuggets with your choice of dip.",
    price: "89.00",
    imageUrl: "/assets/products/Chicken Nuggets.jpg",
    stockQuantity: 28,
    lowStockThreshold: 8,
    addOns: [
      { name: "BBQ Dip", price: "15.00" },
      { name: "Ranch Dip", price: "15.00" },
    ],
  },
  {
    categorySlug: "drinks",
    name: "House Iced Tea",
    slug: "house-iced-tea",
    description: "Cold brewed house iced tea.",
    price: "49.00",
    imageUrl: "/assets/products/House Iced Tea.jpg",
    stockQuantity: 60,
    lowStockThreshold: 15,
    addOns: [],
  },
  {
    categorySlug: "drinks",
    name: "Craft Soda",
    slug: "craft-soda",
    description: "Refreshing soda in rotating flavors.",
    price: "59.00",
    imageUrl: "/assets/products/Craft Soda.jpg",
    stockQuantity: 40,
    lowStockThreshold: 10,
    addOns: [],
  },
  {
    categorySlug: "combos",
    name: "Burger Barkada Box",
    slug: "burger-barkada-box",
    description: "Four classic burgers, two large fries, and four iced teas.",
    price: "549.00",
    imageUrl: "/assets/products/Burger Barkada Box.png",
    stockQuantity: 12,
    lowStockThreshold: 3,
    isFeatured: true,
    addOns: [
      { name: "Upgrade to Double Cheese", price: "180.00" },
      { name: "Add Nuggets", price: "89.00" },
    ],
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.addOn.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.create({
    data: {
      name: "Kanto Admin",
      email: "admin@kantoburger.test",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const categoryRecords = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.create({ data: category });
    categoryRecords.set(category.slug, record.id);
  }

  for (const product of products) {
    const categoryId = categoryRecords.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category: ${product.categorySlug}`);
    }

    await prisma.product.create({
      data: {
        categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        isFeatured: product.isFeatured ?? false,
        addOns: {
          create: product.addOns,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
