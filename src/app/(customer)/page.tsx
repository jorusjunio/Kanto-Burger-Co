import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clock,
  Flame,
  MapPin,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  Truck,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CustomerTopBar } from "@/components/customer/customer-top-bar";
import { FavoriteCard } from "@/components/customer/favorite-card";
import { HeroBurgerShowcase } from "@/components/customer/hero-burger-showcase";
import { getMenuCategories } from "@/features/menu/queries";
import { formatPeso } from "@/lib/format";

export const revalidate = 60;

const highlights: Array<[string, LucideIcon, string, string]> = [
  [
    "01",
    Flame,
    "Smashed hot",
    "Crisp-edged patties, melty cheese, toasted buns.",
  ],
  [
    "02",
    Sparkles,
    "Barkada ready",
    "Combos, sides, and drinks built for sharing.",
  ],
  [
    "03",
    Truck,
    "Checkout fast",
    "Pickup or delivery with manual GCash support.",
  ],
];

const serviceNotes: Array<[LucideIcon, string]> = [
  [Clock, "20-30 min prep"],
  [Truck, "Pickup + delivery"],
  [MapPin, "Quezon City"],
];

// Drifting embers for the hero background — positions/timing keep them organic.
const heroEmbers: Array<{ left: string; delay: string; duration: string }> = [
  { left: "8%", delay: "0s", duration: "9s" },
  { left: "18%", delay: "-3s", duration: "11s" },
  { left: "29%", delay: "-6s", duration: "8.5s" },
  { left: "41%", delay: "-1.5s", duration: "10.5s" },
  { left: "55%", delay: "-4.5s", duration: "9.5s" },
  { left: "67%", delay: "-2s", duration: "12s" },
  { left: "78%", delay: "-7s", duration: "8s" },
  { left: "88%", delay: "-5s", duration: "11.5s" },
  { left: "95%", delay: "-3.5s", duration: "10s" },
];

const crowdFavoriteNames = [
  "Double Cheese Smash",
  "Crispy Chicken Sandwich",
  "Loaded Cheese Fries",
  "Burger Barkada Box",
];

const productImageOverrides: Record<string, string> = {
  "Double Cheese Smash": "/assets/products/Double Cheese Smash.png",
  "Crispy Chicken Sandwich": "/assets/products/Crispy Chicken Sandwich 2026.jpg",
  "Loaded Cheese Fries": "/assets/products/Loaded Cheese Fries.png",
  "Burger Barkada Box": "/assets/products/Burger Barkada Box.png",
};

const productCardAccents: Record<
  string,
  { label: string; imageClass: string; tone: string }
> = {
  "Double Cheese Smash": {
    label: "Best seller",
    imageClass: "object-[52%_44%]",
    tone: "Double cheese drip",
  },
  "Crispy Chicken Sandwich": {
    label: "Crunch pick",
    imageClass: "object-[50%_50%]",
    tone: "Golden crispy bite",
  },
  "Loaded Cheese Fries": {
    label: "Shareable",
    imageClass: "object-[50%_44%]",
    tone: "Saucy loaded fries",
  },
  "Burger Barkada Box": {
    label: "For groups",
    imageClass: "object-[48%_48%]",
    tone: "Barkada bundle",
  },
};

function getProductImage(product: { imageUrl: string | null; name: string }) {
  return productImageOverrides[product.name] ?? product.imageUrl;
}

export default async function Home() {
  const menuCategories = await getMenuCategories();
  const allProducts = menuCategories.flatMap((category) => category.products);
  const preferredFavorites = crowdFavoriteNames
    .map((name) => allProducts.find((product) => product.name === name))
    .filter((product): product is (typeof allProducts)[number] =>
      Boolean(product),
    );
  const fallbackFavorites = allProducts
    .filter(
      (product) =>
        product.isFeatured &&
        !preferredFavorites.some((favorite) => favorite.id === product.id),
    )
    .slice(0, 4 - preferredFavorites.length);
  const featuredProducts = [...preferredFavorites, ...fallbackFavorites].slice(
    0,
    4,
  );
  const heroImage = "/assets/decor-cutouts/burger-hero-no-bg.png";
  const heroBackdrop = "/assets/hero/Wide banner.jpg";

  return (
    <main className="storefront-bg min-h-screen overflow-hidden">
      <div className="fixed inset-x-0 top-4 z-50 px-4 sm:px-8 lg:px-12">
        <CustomerTopBar variant="hero" />
      </div>

      <section
        id="home-hero"
        className="relative z-0 min-h-screen overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#fff7ed]/35" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,240,0.16),rgba(255,247,232,0.8))]" />

        <div
          className="relative min-h-screen w-full overflow-hidden bg-[#160806]/88 px-4 pb-8 pt-24 shadow-2xl shadow-orange-950/25 backdrop-blur-md sm:px-8 sm:pb-10 sm:pt-28 lg:px-12"
        >
          <Image
            src={heroBackdrop}
            alt=""
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover object-center opacity-60"
            priority
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,3,2,0.98)_0%,rgba(28,7,5,0.92)_42%,rgba(127,29,29,0.5)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_36%,rgba(251,191,36,0.34),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.1),transparent_28%,rgba(0,0,0,0.2))]" />

          {/* Floating embers — keeps the hero backdrop alive */}
          <div className="hero-embers" aria-hidden="true">
            {heroEmbers.map((ember, index) => (
              <span
                key={index}
                className="hero-ember"
                style={
                  {
                    left: ember.left,
                    animationDelay: ember.delay,
                    animationDuration: ember.duration,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 xl:gap-28">
            <div
              className="hero-copy flex min-h-[470px] flex-col justify-center gap-7 lg:min-h-[calc(100vh-112px)] lg:-translate-x-4 xl:-translate-x-8"
            >
              <div className="space-y-5">
                <p
                  className="hero-kicker text-sm font-black uppercase text-amber-300"
                  data-scroll-reveal
                  suppressHydrationWarning
                  style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
                >
                  Affordable and very filling
                </p>
                <h1
                  className="max-w-[11ch] text-4xl font-black uppercase leading-[0.98] tracking-[0] text-white sm:max-w-xl sm:text-7xl lg:transition-transform lg:duration-500 lg:hover:translate-x-1"
                  data-scroll-reveal
                  suppressHydrationWarning
                  style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
                >
                  Hot, fresh burgers made for{" "}
                  <span className="text-amber-300">any time</span> cravings
                </h1>
                <p
                  className="max-w-[22rem] text-sm font-semibold leading-6 text-white/80 sm:max-w-md sm:text-base sm:leading-7"
                  data-scroll-reveal
                  suppressHydrationWarning
                  style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
                >
                  Fresh buns, juicy patties, loaded sides, and cold drinks made
                  for kanto cravings. Every bite is packed hot for pickup or
                  delivery.
                </p>
              </div>

              <div
                className="flex max-w-[22rem] flex-col gap-3 sm:max-w-none sm:flex-row"
                data-scroll-reveal
                suppressHydrationWarning
                style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
              >
                <Button
                  asChild
                  className="hero-action-primary h-12 w-full bg-amber-400 px-6 text-base font-black text-red-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300 sm:w-auto"
                >
                  <Link href="/menu">
                    Order Now
                    <ShoppingBag aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="hero-action-secondary h-12 w-full border-white/40 bg-white/10 px-6 font-black text-white backdrop-blur-md hover:bg-white hover:text-red-900 sm:w-auto"
                >
                  <Link href="/menu#combos">
                    See Our Menu
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              <div
                className="grid max-w-[22rem] gap-3 text-sm font-black text-white/80 sm:max-w-xl sm:grid-cols-3"
                data-scroll-reveal
                suppressHydrationWarning
                style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
              >
                {serviceNotes.map(([Icon, label]) => (
                  <div
                    key={label}
                    className="hero-service-card group flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md"
                  >
                    <Icon
                      className="size-4 text-amber-300 transition-transform duration-300 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative min-h-[440px] lg:min-h-[calc(100vh-112px)] lg:translate-x-6 xl:translate-x-10"
              data-scroll-reveal
              suppressHydrationWarning
              style={{ "--reveal-delay": "480ms" } as React.CSSProperties}
            >
              <HeroBurgerShowcase
                heroImage={heroImage}
                priceLabel={formatPeso(159)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-4 bg-[oklch(0.982_0.025_82)] px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="ambient-orbs" aria-hidden="true">
          <span
            className="ambient-orb ambient-orb--amber"
            style={{ top: "-4rem", left: "-3rem", animationDuration: "16s" } as React.CSSProperties}
          />
          <span
            className="ambient-orb ambient-orb--green"
            style={{ top: "20%", right: "-4rem", animationDuration: "20s", animationDelay: "-5s" } as React.CSSProperties}
          />
          <span
            className="ambient-orb ambient-orb--red"
            style={{ bottom: "-5rem", left: "42%", animationDuration: "18s", animationDelay: "-8s" } as React.CSSProperties}
          />
        </div>
        {highlights.map(([count, Icon, title, copy], index) => (
          <div
            key={title}
            className="highlight-card group relative overflow-hidden rounded-xl border border-orange-900/15 bg-white/90 p-5 shadow-[0_18px_45px_rgb(120_53_15_/_0.08)]"
            data-scroll-reveal="static"
            suppressHydrationWarning
            style={{ "--reveal-delay": `${index * 120}ms` } as React.CSSProperties}
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-red-700/55">
                  Step {count}
                </p>
                <p className="mt-4 text-lg font-black uppercase text-[#25130b]">
                  {title}
                </p>
              </div>
              <div className="rounded-full bg-red-700 p-3 text-amber-100 shadow-lg shadow-red-900/15 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <p className="relative z-10 mt-3 text-sm font-semibold leading-6 text-orange-950/65">
              {copy}
            </p>
            <p className="absolute -bottom-5 right-4 text-7xl font-black leading-none text-red-700/[0.07] transition duration-300 group-hover:-translate-y-1 group-hover:text-red-700/[0.12]">
              {count}
            </p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto max-w-7xl bg-[oklch(0.982_0.025_82)] px-4 pb-12 pt-2 sm:px-6">
        <div className="ambient-orbs" aria-hidden="true">
          <span
            className="ambient-orb ambient-orb--red"
            style={{ top: "-3rem", right: "8%", animationDuration: "19s" } as React.CSSProperties}
          />
          <span
            className="ambient-orb ambient-orb--amber"
            style={{ bottom: "-4rem", left: "-2rem", animationDuration: "22s", animationDelay: "-6s" } as React.CSSProperties}
          />
        </div>
        <div
          className="mb-6 flex items-end justify-between gap-4"
          data-scroll-reveal
          suppressHydrationWarning
        >
          <div>
            <p className="section-kicker">Featured picks</p>
            <h2 className="food-heading mt-2 text-3xl leading-none sm:text-4xl">
              Crowd favorites
            </h2>
          </div>
          <Button
            variant="outline"
            className="border-orange-900/20 bg-white/80 font-black text-orange-950 hover:text-red-700"
            asChild
          >
            <Link href="/menu">
              Full Menu
              <Utensils aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => {
            const image = getProductImage(product);
            const accent = productCardAccents[product.name] ?? {
              label: "Favorite",
              imageClass: "object-center",
              tone: "Hot kanto pick",
            };

            return (
              <FavoriteCard
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={image}
                index={index}
                accent={accent}
                href={`/menu#item-${product.slug}`}
              />
            );
          })}
        </div>
      </section>

      <footer
        className="border-t border-red-950/10 bg-[#1d0906] px-4 py-10 text-orange-50 sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <p className="text-2xl font-black uppercase text-amber-300">
              Kanto Burger Co.
            </p>
            <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-orange-50/72">
              Hot smashed burgers, loaded sides, and cold drinks made for quick
              pickup or delivery around Quezon City.
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href="#"
                aria-label="Kanto Burger Co. Facebook"
                className="footer-social"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#"
                aria-label="Kanto Burger Co. Instagram"
                className="footer-social"
              >
                <Camera className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#"
                aria-label="Message Kanto Burger Co."
                className="footer-social"
              >
                <Send className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div>
            <p className="footer-title">Visit</p>
            <p className="footer-copy">Quezon City, Philippines</p>
            <p className="footer-copy">Open daily, 10:00 AM - 10:00 PM</p>
          </div>

          <div>
            <p className="footer-title">Contact</p>
            <p className="footer-copy">0912 345 6789</p>
            <p className="footer-copy">hello@kantoburger.co</p>
            <p className="footer-copy">GCash payments supported</p>
          </div>

          <div>
            <p className="footer-title">Quick Links</p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-orange-50/70">
              <Link href="/menu" className="footer-link">
                Menu
              </Link>
              <Link href="/cart" className="footer-link">
                Cart
              </Link>
              <Link href="/checkout" className="footer-link">
                Checkout
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-5 text-xs font-bold uppercase text-orange-50/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 Kanto Burger Co. All rights reserved.</p>
          <p>Fresh buns. Smashed patties. Fast checkout.</p>
        </div>
      </footer>
    </main>
  );
}
