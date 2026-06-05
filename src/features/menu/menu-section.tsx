import { ProductCard } from "./product-card";
import type { MenuCategory } from "./types";

type MenuSectionProps = {
  category: MenuCategory;
};

export function MenuSection({ category }: MenuSectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-32 space-y-4">
      <div className="flex items-end justify-between gap-4 border-b border-orange-900/10 pb-4">
        <div>
          <p className="section-kicker">Menu category</p>
          <h2 className="food-heading text-3xl leading-none">
            {category.name}
          </h2>
          <p className="mt-1 text-sm font-bold text-orange-950/55">
            {category.products.length} items
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
