"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Tags, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { createCategory, moveCategory, updateCategory } from "./actions";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
};

function MoveButton({
  categoryId,
  direction,
  disabled,
}: {
  categoryId: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;

  return (
    <form action={moveCategory}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={`Move ${direction}`}
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-colors duration-200",
          disabled
            ? "cursor-default text-orange-950/15"
            : "text-orange-950/40 hover:bg-orange-950/5 hover:text-red-700",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function CategoryItem({
  category,
  index,
  count,
}: {
  category: CategoryRow;
  index: number;
  count: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="bg-orange-950/[0.02] px-5 py-4">
        <form
          action={updateCategory.bind(null, category.id)}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          {/* Order is owned by the arrows — carry the current value through. */}
          <input type="hidden" name="sortOrder" value={category.sortOrder} />
          <div className="space-y-1.5">
            <Label htmlFor={`name-${category.id}`} className="checkout-label">
              Name
            </Label>
            <Input
              id={`name-${category.id}`}
              name="name"
              defaultValue={category.name}
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`slug-${category.id}`} className="checkout-label">
              Slug
            </Label>
            <Input
              id={`slug-${category.id}`}
              name="slug"
              defaultValue={category.slug}
              required
              className="bg-white font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="h-9 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
              className="h-9 rounded-full px-4 text-sm font-bold text-orange-950/50 transition-colors hover:bg-orange-950/5 hover:text-[#25130b]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-orange-50/50">
      {/* Position */}
      <span className="w-6 shrink-0 font-mono text-xs font-bold text-orange-950/30 tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Name + slug */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#25130b]">
          {category.name}
        </p>
        <p className="truncate font-mono text-[11px] text-orange-950/35">
          /{category.slug}
        </p>
      </div>

      {/* Product count */}
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums",
          category.productCount > 0
            ? "bg-orange-950/5 text-orange-950/55"
            : "bg-amber-500/10 text-amber-700",
        )}
      >
        {category.productCount} product{category.productCount !== 1 ? "s" : ""}
      </span>

      {/* Reorder + edit */}
      <div className="flex shrink-0 items-center gap-0.5">
        <MoveButton
          categoryId={category.id}
          direction="up"
          disabled={index === 0}
        />
        <MoveButton
          categoryId={category.id}
          direction="down"
          disabled={index === count - 1}
        />
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${category.name}`}
          className="ml-1 flex size-7 items-center justify-center rounded-full text-orange-950/40 transition-colors duration-200 hover:bg-orange-950/5 hover:text-red-700"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function CategoriesManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-orange-950/45 tabular-nums">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          <span className="mx-1.5 text-orange-950/20">·</span>
          storefront order, top to bottom
        </p>
        <Button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className={cn(
            "h-9 rounded-full px-4 text-sm font-bold transition-colors duration-200",
            adding
              ? "bg-orange-950/5 text-orange-950/60 hover:bg-orange-950/10"
              : "bg-red-600 text-white hover:bg-red-700",
          )}
        >
          {adding ? (
            <>
              <X className="size-4" aria-hidden="true" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" />
              New category
            </>
          )}
        </Button>
      </div>

      {/* Collapsible create form */}
      {adding ? (
        <form
          action={createCategory}
          className="checkout-section-enter grid gap-3 rounded-xl bg-white p-5 ring-1 ring-orange-900/10 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          {/* New categories land at the end of the list. */}
          <input type="hidden" name="sortOrder" value={categories.length} />
          <div className="space-y-1.5">
            <Label htmlFor="new-name" className="checkout-label">
              Name
            </Label>
            <Input
              id="new-name"
              name="name"
              placeholder="e.g. Desserts"
              required
              autoFocus
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-slug" className="checkout-label">
              Slug <span className="normal-case">(optional)</span>
            </Label>
            <Input
              id="new-slug"
              name="slug"
              placeholder="auto-generated"
              className="bg-white font-mono text-sm"
            />
          </div>
          <Button
            type="submit"
            className="h-9 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Add category
          </Button>
        </form>
      ) : null}

      {/* List */}
      {categories.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center ring-1 ring-orange-900/10 animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
            <Tags aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">
            No categories yet
          </h2>
          <p className="mt-2 max-w-md text-orange-950/45">
            Add categories before creating products.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-orange-900/6 overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10 animate-fade-in">
          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              category={category}
              index={index}
              count={categories.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
