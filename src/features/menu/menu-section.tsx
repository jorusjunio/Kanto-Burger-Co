import { ProductCard } from "./product-card";
import { StaggeredGrid } from "./staggered-grid";
import type { MenuCategory } from "./types";

type MenuSectionProps = {
  category: MenuCategory;
};

export function MenuSection({ category }: MenuSectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-32 space-y-5">
      <div className="flex items-end justify-between gap-4 border-b border-orange-900/8 pb-4">
        <div>
          <p className="section-kicker">Menu category</p>
          <h2 className="food-heading text-3xl leading-none">
            {category.name}
          </h2>
          <p className="mt-1.5 text-sm font-bold text-orange-950/45">
            {category.products.length} items
          </p>
        </div>
      </div>

      <StaggeredGrid>
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </StaggeredGrid>
    </section>
  );
}
