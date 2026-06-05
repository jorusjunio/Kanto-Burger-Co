import { z } from "zod";

const availabilityValues = new Set([
  "available",
  "unavailable",
  "true",
  "false",
  "yes",
  "no",
  "disabled",
]);

const optionalImageUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith("/assets/products/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    {
      message:
        "Image URL must be a valid http, https, or /assets/products path.",
    },
  );

const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required."),
  slug: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0),
});

const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),
  name: z.string().trim().min(2, "Product name is required."),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(5, "Description is required."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  imageUrl: optionalImageUrlSchema,
  isFeatured: z.coerce.boolean(),
  isAvailable: z.coerce.boolean(),
  trackStock: z.coerce.boolean(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  addOns: z.string().trim().optional(),
});

export const imageFileSchema = z
  .instanceof(File)
  .optional()
  .refine((file) => !file || file.size === 0 || file.type.startsWith("image/"), {
    message: "Product image must be an image file.",
  })
  .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
    message: "Product image must be 5MB or smaller.",
  });

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function resolveSlug(inputSlug: string | undefined, fallbackName: string) {
  const slug = inputSlug ? slugify(inputSlug) : slugify(fallbackName);

  if (!slug) {
    throw new Error("Slug must include at least one letter or number.");
  }

  return slug;
}

export function money(value: number) {
  return value.toFixed(2);
}

export function readProductForm(formData: FormData) {
  return productSchema.parse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
    isFeatured: checkboxValue(formData, "isFeatured"),
    isAvailable: checkboxValue(formData, "isAvailable"),
    trackStock: checkboxValue(formData, "trackStock"),
    stockQuantity: formData.get("stockQuantity"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    addOns: formData.get("addOns"),
  });
}

export function readCategoryForm(formData: FormData) {
  return categorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
  });
}

export function parseAddOns(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|").map((part) => part.trim());
      const [name = "", price = "0", availability = "available"] = parts;
      const numericPrice = Number(price);
      const normalizedAvailability = availability.toLowerCase();

      if (parts.length > 3) {
        throw new Error(`Add-on line ${index + 1} has too many separators.`);
      }

      if (!name) {
        throw new Error(`Add-on line ${index + 1} is missing a name.`);
      }

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        throw new Error(`Add-on line ${index + 1} has an invalid price.`);
      }

      if (!availabilityValues.has(normalizedAvailability)) {
        throw new Error(
          `Add-on line ${index + 1} availability must be available or unavailable.`,
        );
      }

      return {
        name,
        price: money(numericPrice),
        isAvailable: !["false", "no", "unavailable", "disabled"].includes(
          normalizedAvailability,
        ),
      };
    });
}

export function readAvailabilityToggle(formData: FormData) {
  const productId = z.string().min(1).parse(formData.get("productId"));
  const isAvailable = z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .parse(formData.get("isAvailable"));

  return { productId, isAvailable };
}
