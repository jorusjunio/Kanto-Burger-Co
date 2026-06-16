import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/admin/orders/order-badges";
import { getAdminOrders } from "@/features/admin/orders/queries";
import { formatPeso } from "@/lib/format";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
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
        <Button
          variant="outline"
          asChild
          className="transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:text-red-700 hover:shadow-md"
        >
          <Link href="/menu">View Storefront</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white bg-white/90 p-8 text-center shadow-md shadow-stone-100/50 animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
            <ClipboardList aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">No orders yet</h2>
          <p className="mt-2 max-w-md text-stone-500">
            Customer orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-md shadow-stone-100/50 animate-fade-in">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
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
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-black">
                    {formatPeso(Number(order.total))}
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      asChild
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-md hover:shadow-red-600/30"
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
        </div>
      )}
    </div>
  );
}
