import { OrdersView } from "@/features/admin/orders/orders-table";
import { getAdminOrders } from "@/features/admin/orders/queries";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const rows = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    orderType: order.orderType,
    itemsCount: order.items.length,
    total: Number(order.total),
    createdAt: order.createdAt,
  }));

  return <OrdersView orders={rows} />;
}
