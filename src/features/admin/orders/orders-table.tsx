"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, ClipboardList, Download, FilterX, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { OrderStatusBadge, PaymentStatusBadge } from "./order-badges";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  orderType: string;
  itemsCount: number;
  total: number;
  createdAt: Date;
};

const ALL = "ALL";

/* Status tabs, in kitchen-flow order. */
const statusTabs = [
  [ALL, "All"],
  ["PENDING", "Pending"],
  ["PREPARING", "Preparing"],
  ["READY", "Ready"],
  ["OUT_FOR_DELIVERY", "Out"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
] as const;

const paymentOptions = [
  [ALL, "All payments"],
  ["UNPAID", "Unpaid"],
  ["PENDING", "Awaiting GCash"],
  ["PAID", "Paid"],
];

const typeOptions = [
  [ALL, "All types"],
  ["PICKUP", "Pickup"],
  ["DELIVERY", "Delivery"],
];

const selectTriggerClassName =
  "h-9 w-full min-w-0 rounded-full bg-white px-3.5 text-xs font-bold text-orange-950/70 ring-1 ring-orange-900/10 border-0 shadow-none transition-colors duration-200 hover:ring-orange-900/25 sm:w-auto";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

function exportCsv(rows: AdminOrderRow[]) {
  const header = [
    "Order #",
    "Customer",
    "Phone",
    "Status",
    "Payment",
    "Type",
    "Items",
    "Total",
    "Created",
  ];
  const lines = rows.map((row) => [
    row.orderNumber,
    row.customerName,
    row.customerPhone,
    row.status,
    row.paymentStatus,
    row.orderType,
    row.itemsCount,
    row.total,
    new Date(row.createdAt).toLocaleString("en-PH"),
  ]);
  const csv = [header, ...lines]
    .map((cols) =>
      cols.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `kanto-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OrdersView({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(ALL);
  const [payment, setPayment] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [query, setQuery] = useState("");

  // Everything except the status tab narrows the pool; tab counts are computed
  // against this pool so the numbers stay truthful while filtering.
  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (order) =>
        (payment === ALL || order.paymentStatus === payment) &&
        (type === ALL || order.orderType === type) &&
        (q === "" ||
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerPhone.toLowerCase().includes(q)),
    );
  }, [orders, payment, type, query]);

  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { [ALL]: pool.length };
    for (const order of pool) {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    }
    return counts;
  }, [pool]);

  // Newest first — the only ordering managers actually reach for.
  const filtered = useMemo(
    () =>
      pool
        .filter((order) => status === ALL || order.status === status)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [pool, status],
  );

  const filteredRevenue = useMemo(
    () =>
      filtered.reduce(
        (sum, order) =>
          order.status === "CANCELLED" ? sum : sum + order.total,
        0,
      ),
    [filtered],
  );

  const hasActiveFilters =
    status !== ALL || payment !== ALL || type !== ALL || query.trim() !== "";

  function clearFilters() {
    setStatus(ALL);
    setPayment(ALL);
    setType(ALL);
    setQuery("");
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#25130b]">Orders</h1>
          <p className="mt-1 text-sm text-orange-950/45">
            Track incoming orders and update kitchen/payment status.
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="flex items-center gap-2">
            {/* Search */}
            <label className="relative flex-1 lg:w-72 lg:flex-none">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-orange-950/30"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search order #, customer, phone…"
                className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm font-medium text-[#25130b] ring-1 ring-orange-900/10 transition-shadow duration-200 placeholder:text-orange-950/30 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </label>

            {/* Export */}
            <Button
              type="button"
              variant="outline"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="h-10 shrink-0 rounded-full border-0 bg-white px-4 text-xs font-bold text-orange-950/70 ring-1 ring-orange-900/10 transition-colors hover:bg-white hover:text-red-700 hover:ring-orange-900/25"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Export
            </Button>
          </div>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center ring-1 ring-orange-900/10 animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
            <ClipboardList aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">No orders yet</h2>
          <p className="mt-2 max-w-md text-orange-950/45">
            Customer orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <>
          {/* ── Status tabs ── */}
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full items-center gap-0.5 rounded-full bg-orange-950/[0.05] p-1">
              {statusTabs.map(([value, label]) => {
                const active = status === value;
                const count = countsByStatus[value] ?? 0;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    aria-pressed={active}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors duration-200",
                      active
                        ? "bg-white text-[#25130b] shadow-sm"
                        : "text-orange-950/45 hover:text-[#25130b]",
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        "tabular-nums",
                        active ? "text-red-700" : "text-orange-950/30",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── One-line toolbar: type + payment + clear, summary at right ── */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className={selectTriggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger className={selectTriggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="h-9 rounded-full px-3 text-xs font-bold text-orange-950/45 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <FilterX className="size-3.5" aria-hidden="true" />
                Clear
              </Button>
            ) : null}

            {/* Summary — count + live revenue of the current view */}
            <p className="ml-auto text-xs font-bold text-orange-950/45 tabular-nums">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              <span className="mx-1.5 text-orange-950/20">·</span>
              {formatPeso(filteredRevenue)}
            </p>
          </div>

          {/* ── Table ── */}
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10 animate-fade-in">
            {filtered.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
                  <ClipboardList aria-hidden="true" />
                </div>
                <h2 className="text-lg font-black text-[#25130b]">
                  No orders match these filters
                </h2>
                <p className="mt-1 max-w-md text-sm text-orange-950/45">
                  Try clearing one or more filters to widen the results.
                </p>
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-auto">
                <Table className="admin-table">
                  <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_rgba(120,53,15,0.08)]">
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                      <TableHead aria-label="Open" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <TableRow
                        key={order.id}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="group cursor-pointer transition-colors duration-150 hover:bg-orange-50/60"
                      >
                        <TableCell className="font-mono text-xs font-bold text-[#25130b]">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-[#25130b]">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-orange-950/40">
                            {order.customerPhone}
                          </p>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge value={order.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge value={order.paymentStatus} />
                        </TableCell>
                        <TableCell className="text-xs font-bold uppercase tracking-wide text-orange-950/50">
                          {order.orderType}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-orange-950/60">
                          {order.itemsCount}
                        </TableCell>
                        <TableCell className="text-right font-black tabular-nums">
                          {formatPeso(order.total)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-orange-950/45 tabular-nums">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="w-10 text-right">
                          <ChevronRight
                            className="ml-auto size-4 text-orange-950/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-red-700"
                            aria-hidden="true"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
