"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit,
  ImageOff,
  Plus,
  Search,
  Star,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

import { adjustStock, toggleProductAvailability } from "./actions";
import { DeleteProductDialog } from "./delete-product-dialog";

export type AdminMenuRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  isFeatured: boolean;
  isAvailable: boolean;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  addOnsCount: number;
};

const ALL = "ALL";

/* Availability tabs — the manager's main lens on the menu. */
const availabilityTabs = [
  [ALL, "All"],
  ["LIVE", "Live"],
  ["HIDDEN", "Hidden"],
] as const;

type StockState = "untracked" | "ok" | "low" | "out";

function stockState(row: AdminMenuRow): StockState {
  if (!row.trackStock) return "untracked";
  if (row.stockQuantity <= 0) return "out";
  if (row.stockQuantity <= row.lowStockThreshold) return "low";
  return "ok";
}

/** One-tap restock/deduct — submits the shared adjustStock action. */
function StockNudge({
  productId,
  delta,
  disabled,
}: {
  productId: string;
  delta: number;
  disabled?: boolean;
}) {
  return (
    <form action={adjustStock}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="delta" value={delta} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={delta > 0 ? "Add 1 stock" : "Remove 1 stock"}
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-sm font-black leading-none transition-colors duration-200",
          disabled
            ? "cursor-default text-orange-950/15"
            : "text-orange-950/40 hover:bg-orange-950/8 hover:text-red-700",
        )}
      >
        {delta > 0 ? "+" : "−"}
      </button>
    </form>
  );
}

function StockCell({ row }: { row: AdminMenuRow }) {
  const state = stockState(row);

  if (state === "untracked") {
    return (
      <span className="text-xs font-bold text-orange-950/35">Not tracked</span>
    );
  }

  return (
    <div className="min-w-24">
      <div className="flex items-center gap-1.5">
        <StockNudge
          productId={row.id}
          delta={-1}
          disabled={row.stockQuantity <= 0}
        />
        <span
          className={cn(
            "min-w-6 text-center text-sm font-black tabular-nums",
            state === "out" && "text-red-700",
            state === "low" && "text-amber-600",
            state === "ok" && "text-[#25130b]",
          )}
        >
          {row.stockQuantity}
        </span>
        <StockNudge productId={row.id} delta={1} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950/35">
          {state === "out" ? "sold out" : state === "low" ? "low" : "in stock"}
        </span>
      </div>
      {/* Quiet meter — full width is 2× the low-stock threshold. */}
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-orange-950/8">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            state === "out" && "bg-red-500",
            state === "low" && "bg-amber-500",
            state === "ok" && "bg-emerald-500",
          )}
          style={{
            width: `${Math.min(
              (row.stockQuantity / Math.max(row.lowStockThreshold * 2, 1)) * 100,
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function AvailabilityToggle({ row }: { row: AdminMenuRow }) {
  return (
    <form action={toggleProductAvailability}>
      <input type="hidden" name="productId" value={row.id} />
      <input
        type="hidden"
        name="isAvailable"
        value={row.isAvailable ? "false" : "true"}
      />
      {/* Switch-styled submit — state is obvious at a glance, one tap flips it. */}
      <button
        type="submit"
        role="switch"
        aria-checked={row.isAvailable}
        aria-label={`${row.isAvailable ? "Hide" : "Show"} ${row.name}`}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          row.isAvailable ? "bg-emerald-500" : "bg-orange-950/15",
        )}
      >
        <span
          className={cn(
            "inline-block size-4.5 translate-x-0.75 rounded-full bg-white shadow-sm transition-transform duration-200",
            row.isAvailable && "translate-x-6",
          )}
        />
      </button>
    </form>
  );
}

export function MenuView({
  products,
  tabs,
}: {
  products: AdminMenuRow[];
  /** Optional view-switcher (Products | Categories) rendered under the header. */
  tabs?: React.ReactNode;
}) {
  const [tab, setTab] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [query, setQuery] = useState("");

  // Search + category narrow the pool; tab counts and the attention chip are
  // computed against this pool so every number stays truthful while filtering.
  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (category === ALL || product.categoryId === category) &&
        (q === "" ||
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  const attentionCount = useMemo(
    () =>
      pool.filter((product) => {
        const state = stockState(product);
        return state === "low" || state === "out";
      }).length,
    [pool],
  );

  const tabCounts: Record<string, number> = {
    [ALL]: pool.length,
    LIVE: pool.filter((product) => product.isAvailable).length,
    HIDDEN: pool.filter((product) => !product.isAvailable).length,
  };

  const filtered = pool.filter(
    (product) =>
      (tab === ALL ||
        (tab === "LIVE" ? product.isAvailable : !product.isAvailable)) &&
      (!attentionOnly ||
        stockState(product) === "low" ||
        stockState(product) === "out"),
  );

  // Category chips come from the data itself so empty categories don't clutter.
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      seen.set(product.categoryId, product.categoryName);
    }
    return [...seen.entries()];
  }, [products]);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#25130b]">Menu</h1>
          <p className="mt-1 text-sm text-orange-950/45">
            Products, pricing, availability, and stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {products.length > 0 ? (
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-orange-950/30"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products…"
                className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm font-medium text-[#25130b] ring-1 ring-orange-900/10 transition-shadow duration-200 placeholder:text-orange-950/30 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </label>
          ) : null}
          <Button
            asChild
            className="h-10 shrink-0 rounded-full bg-red-600 px-4 text-xs font-bold text-white transition-colors hover:bg-red-700"
          >
            <Link href="/admin/menu/new">
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Link>
          </Button>
        </div>
      </div>

      {tabs}

      {products.length > 0 ? (
        <>
          {/* ── Availability tabs + attention chip ── */}
          <div className="flex flex-wrap items-center gap-2">
            {availabilityTabs.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-colors",
                  tab === value
                    ? "bg-[#25130b] text-white ring-[#25130b]"
                    : "bg-white text-orange-950/60 ring-orange-900/10 hover:text-red-700",
                )}
              >
                {label}
                <span className="tabular-nums opacity-70">
                  {tabCounts[value]}
                </span>
              </button>
            ))}

            {attentionCount > 0 ? (
              <button
                type="button"
                onClick={() => setAttentionOnly((current) => !current)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-colors",
                  attentionOnly
                    ? "bg-red-600 text-white ring-red-600"
                    : "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100",
                )}
              >
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Needs attention
                <span className="tabular-nums opacity-80">
                  {attentionCount}
                </span>
              </button>
            ) : null}

            {/* Category chips, pushed right on wide screens */}
            {categories.length > 1 ? (
              <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setCategory(ALL)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                    category === ALL
                      ? "bg-red-600 text-white"
                      : "bg-white text-orange-950/55 ring-1 ring-orange-900/10 hover:text-red-700",
                  )}
                >
                  All categories
                </button>
                {categories.map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setCategory((current) => (current === id ? ALL : id))
                    }
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                      category === id
                        ? "bg-red-600 text-white"
                        : "bg-white text-orange-950/55 ring-1 ring-orange-900/10 hover:text-red-700",
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* ── Table ── */}
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10">
            {filtered.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
                  <Search aria-hidden="true" />
                </div>
                <h2 className="text-lg font-black text-[#25130b]">
                  No matching products
                </h2>
                <p className="mt-1 max-w-md text-sm text-orange-950/45">
                  Try clearing the search or switching filters.
                </p>
              </div>
            ) : (
              <Table className="admin-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Live</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product) => (
                    <TableRow
                      key={product.id}
                      className={cn(!product.isAvailable && "opacity-55")}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-orange-950/5 ring-1 ring-orange-900/8">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-orange-950/25">
                                <ImageOff className="size-4" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-black text-[#25130b]">
                                {product.name}
                              </p>
                              {product.isFeatured ? (
                                <Star
                                  className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                                  aria-label="Featured"
                                />
                              ) : null}
                            </div>
                            <p className="mt-0.5 line-clamp-1 max-w-72 text-xs text-orange-950/40">
                              {product.description}
                              {product.addOnsCount > 0
                                ? ` · ${product.addOnsCount} add-on${product.addOnsCount > 1 ? "s" : ""}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-orange-950/5 px-2.5 py-1 text-[11px] font-bold text-orange-950/55">
                          {product.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className="font-black tabular-nums">
                        {formatPeso(product.price)}
                      </TableCell>
                      <TableCell>
                        <StockCell row={product} />
                      </TableCell>
                      <TableCell>
                        <AvailabilityToggle row={product} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-8 rounded-full px-3 text-xs font-bold text-orange-950/55 hover:bg-orange-950/5 hover:text-red-700"
                          >
                            <Link href={`/admin/menu/${product.id}/edit`}>
                              <Edit className="size-3.5" aria-hidden="true" />
                              Edit
                            </Link>
                          </Button>
                          <DeleteProductDialog
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center ring-1 ring-orange-900/10">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
            <Utensils aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">No products yet</h2>
          <p className="mt-2 max-w-md text-orange-950/45">
            Add menu products so customers can start ordering.
          </p>
          <Button
            asChild
            className="mt-5 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <Link href="/admin/menu/new">Add product</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
