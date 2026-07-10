import { KitchenBoard } from "@/features/admin/kitchen/kitchen-board";
import {
  getKitchenCompletedTodayCount,
  getKitchenOrders,
} from "@/features/admin/orders/queries";

type SelectedAddOn = {
  name?: string;
};

/** selectedAddOns is a JSON column — pull out just the names for the card. */
function getAddOnNames(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((addOn: SelectedAddOn) =>
      typeof addOn.name === "string" ? addOn.name : "",
    )
    .filter(Boolean);
}

export default async function KitchenPage() {
  const [orders, completedToday] = await Promise.all([
    getKitchenOrders(),
    getKitchenCompletedTodayCount(),
  ]);
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
      addOns: getAddOnNames(item.selectedAddOns),
      notes: item.notes,
    })),
    createdAt: order.createdAt,
  }));

  return <KitchenBoard orders={cards} completedToday={completedToday} />;
}
