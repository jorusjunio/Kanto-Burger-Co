"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FilterX, ClipboardList } from "lucide-react";

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

const statusOptions = [
  [ALL, "All statuses"],
  ["PENDING", "Pending"],
  ["PREPARING", "Preparing"],
  ["READY", "Ready"],
  ["OUT_FOR_DELIVERY", "Out for delivery"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

const paymentOptions = [
  [ALL, "All payments"],
  ["UNPAID", "Unpaid"],
  ["PENDING", "Pending"],
  ["PAID", "Paid"],
];

const typeOptions = [
  [ALL, "All types"],
  ["PICKUP", "Pickup"],
  ["DELIVERY", "Delivery"],
];

const triggerClassName =
  "h-10 w-full min-w-0 rounded-xl border-2 border-orange-900/10 bg-white px-3.5 text-sm font-bold text-[#25130b] shadow-sm transition-all duration-300 ease-out hover:border-orange-900/20 focus-visible:border-red-500/50 focus-visible:ring-4 focus-visible:ring-red-500/10 sm:min-w-[150px]";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="flex w-full flex-col gap-1.5 sm:w-auto">
      <span className="text-[11px] font-black uppercase tracking-wider text-orange-950/50">
        {label}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function OrdersView({ orders }: { orders: AdminOrderRow[] }) {
  const [status, setStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [type, setType] = useState(ALL);

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          (status === ALL || order.status === status) &&
          (payment === ALL || order.paymentStatus === payment) &&
          (type === ALL || order.orderType === type),
      ),
    [orders, status, payment, type],
  );

  const hasActiveFilters = status !== ALL || payment !== ALL || type !== ALL;

  function clearFilters() {
    setStatus(ALL);
    setPayment(ALL);
    setType(ALL);
  }

  return (
    <div className="space-y-6">
      {/* Header — title left, filters where "View Storefront" used to be */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#25130b]">Orders</h1>
            {orders.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                {orders.length}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-stone-500">
            Track incoming orders and update kitchen/payment status.
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
            <FilterSelect
              label="Status"
              value={status}
              onValueChange={setStatus}
              options={statusOptions}
            />
            <FilterSelect
              label="Payment"
              value={payment}
              onValueChange={setPayment}
              options={paymentOptions}
            />
            <FilterSelect
              label="Type"
              value={type}
              onValueChange={setType}
              options={typeOptions}
            />
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-10 w-full self-end rounded-xl border-2 border-orange-900/10 font-bold text-orange-950/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:text-red-700 hover:shadow-md sm:w-auto"
              >
                <FilterX className="size-4" aria-hidden="true" />
                Clear
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-orange-900/10 bg-white p-8 text-center  animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
            <ClipboardList aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">No orders yet</h2>
          <p className="mt-2 max-w-md text-stone-500">
            Customer orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10 animate-fade-in">
          {filtered.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                <ClipboardList aria-hidden="true" />
              </div>
              <h2 className="text-lg font-black text-[#25130b]">
                No orders match these filters
              </h2>
              <p className="mt-1 max-w-md text-sm text-stone-500">
                Try clearing one or more filters to widen the results.
              </p>
            </div>
          ) : (
            <Table className="admin-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-black">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-[#25130b]">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-stone-500">
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge value={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge value={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-xs font-bold uppercase tracking-wide text-stone-600">
                      {order.orderType}
                    </TableCell>
                    <TableCell>{order.itemsCount}</TableCell>
                    <TableCell className="font-black">
                      {formatPeso(order.total)}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        asChild
                        className="group bg-red-600 text-white transition-all duration-300 hover:bg-red-700"
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          Open
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
