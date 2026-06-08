import Image from "next/image";
import { Clock, Flame, ShoppingBag } from "lucide-react";

import { CategoryNav } from "@/features/menu/category-nav";
import { MenuSection } from "@/features/menu/menu-section";
import { getMenuCategories } from "@/features/menu/queries";

export const revalidate = 60;

export default async function MenuPage() {
  const categories = await getMenuCategories();
  const itemCount = categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <main className="storefront-bg min-h-screen">
      <section className="relative overflow-hidden border-b border-orange-900/10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(120,53,15,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(120,53,15,0.04)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:py-8">
          <div className="space-y-4">
            <p data-entrance="0" className="section-kicker menu-kicker-pulse">
              Fresh from the griddle
            </p>
            <h1
              data-entrance="1"
              className="food-heading menu-title-shimmer max-w-3xl text-3xl leading-none sm:text-5xl"
            >
              Pick your burger. Stack the sides. Checkout in minutes.
            </h1>
            <p
              data-entrance="2"
              className="max-w-xl text-sm font-medium leading-6 text-orange-950/70"
            >
              Browse Kanto Burger Co.&apos;s menu, check stock availability,
              and build your order for pickup or delivery.
            </p>
            <div
              data-entrance="3"
              className="grid max-w-lg gap-3 text-[13px] font-bold text-orange-950/70 sm:grid-cols-3"
            >
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-red-700" aria-hidden="true" />
                Smash burgers
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-red-700" aria-hidden="true" />
                25m average
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-red-700" aria-hidden="true" />
                Live cart
              </div>
            </div>
          </div>
          <div
            data-entrance="4"
            className="relative min-h-[200px] overflow-hidden rounded-lg border border-white/70 bg-red-700 shadow-xl shadow-orange-950/10 sm:min-h-[260px]"
          >
            <Image
              src="/assets/products/Burger Barkada Box.png"
              alt="Burger Barkada Box"
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/75 via-red-950/10 to-transparent" />
            <Image
              src="/assets/products/Fries.png"
              alt=""
              width={110}
              height={110}
              className="pointer-events-none absolute -right-6 -top-5 rotate-12 rounded-full object-contain shadow-lg"
              aria-hidden="true"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-white/92 p-4 shadow-lg">
              <p className="text-sm font-black uppercase text-red-700">
                Today&apos;s counter status
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-black text-[#25130b]">
                    {categories.length}
                  </p>
                  <p className="text-xs font-bold text-orange-950/55">
                    Categories
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#25130b]">
                    {itemCount}
                  </p>
                  <p className="text-xs font-bold text-orange-950/55">
                    Menu items
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#25130b]">25m</p>
                  <p className="text-xs font-bold text-orange-950/55">
                    Avg prep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="cat-nav-entrance">
        <CategoryNav categories={categories} />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6">
        {categories.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
}
