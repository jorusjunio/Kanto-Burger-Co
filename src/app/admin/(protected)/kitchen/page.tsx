import { KitchenBoard } from "@/features/admin/kitchen/kitchen-board";
import { getKitchenOrders } from "@/features/admin/orders/queries";

export default async function KitchenPage() {
  const orders = await getKitchenOrders();
  const cards = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    orderType: order.orderType,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt,
  }));

  return <KitchenBoard orders={cards} />;
}
