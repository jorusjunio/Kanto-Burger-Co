import Link from "next/link";
import { ClipboardList } from "lucide-react";

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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-red-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black text-zinc-950">Orders</h1>
            <p className="mt-2 text-zinc-600">
              Track incoming orders and update kitchen/payment status.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/menu">View Storefront</Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
              <ClipboardList aria-hidden="true" />
            </div>
            <h2 className="text-xl font-black text-zinc-950">No orders yet</h2>
            <p className="mt-2 max-w-md text-zinc-600">
              Customer orders will appear here after checkout.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white">
            <Table>
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
                        <p className="font-bold text-zinc-950">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-zinc-500">
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
                      <Button size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </main>
  );
}
