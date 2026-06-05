export type MenuAddOn = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
};

export type MenuProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  addOns: MenuAddOn[];
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  products: MenuProduct[];
};
