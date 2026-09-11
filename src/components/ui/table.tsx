"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"table"> & { containerClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

/**
 * Shared "sticky header while scrolling within the table" recipe, used by
 * every admin table so they behave the same way instead of each growing its
 * own variant.
 *
 * `containerClassName`: pass to Table's `containerClassName` prop. Caps the
 * table at a scrollable height. It must set BOTH axes' overflow here (not
 * just overflow-y): per the CSS overflow spec, a non-"visible" overflow-x
 * forces the browser to compute overflow-y as "auto" too, no matter what you
 * set it to. Table's own container already sets overflow-x-auto, so if this
 * height cap lived on a separate ancestor div instead, THAT div would get
 * silently promoted to a phantom scroll container by the same spec rule
 * (auto overflow-y, but never anything to scroll since it has no height cap)
 * and steal the sticky header's positioning context, so the header would just
 * scroll away with everything else. Applying the cap directly to Table's own
 * container sidesteps that: it becomes the one real scrolling pane.
 *
 * `headRowClassName`: pass to the header `<TableRow>`. Sticky goes on each
 * `<th>` (via the `[&>th]` selector), not on `<TableHeader>`/`<thead>`, since
 * sticky on the row-group element doesn't reliably stick across browsers in
 * a table layout.
 */
const ADMIN_STICKY_TABLE_CONTAINER_CLASS = "max-h-[65vh] overflow-y-auto"
const ADMIN_STICKY_TABLE_HEAD_ROW_CLASS =
  "[&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-white [&>th]:shadow-[0_1px_0_rgba(120,53,15,0.08)]"

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  ADMIN_STICKY_TABLE_CONTAINER_CLASS,
  ADMIN_STICKY_TABLE_HEAD_ROW_CLASS,
}
