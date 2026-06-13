"use client";

interface RecentOrder {
  orderNo: string;
  customer: string;
  time: string;
  amount: number;
  status:
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "COMPLETED"
    | "CANCELLED";
}

interface RecentOrdersTableProps {
  data?: RecentOrder[];
}

export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
  const orders = data || [
    { orderNo: "#ORD-001", customer: "Juan Dela Cruz", time: "2:30 PM", amount: 450, status: "PENDING" },
    { orderNo: "#ORD-002", customer: "Maria Santos", time: "2:15 PM", amount: 680, status: "PREPARING" },
    { orderNo: "#ORD-003", customer: "Pedro Reyes", time: "1:58 PM", amount: 320, status: "READY" },
    { orderNo: "#ORD-004", customer: "Ana Garcia", time: "1:42 PM", amount: 890, status: "COMPLETED" },
    { orderNo: "#ORD-005", customer: "Carlos Mendoza", time: "1:25 PM", amount: 540, status: "COMPLETED" },
  ];

  const getStatusColor = (status: RecentOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "PREPARING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "READY":
        return "bg-green-100 text-green-700 border-green-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-stone-100 text-stone-700 border-stone-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Order No
            </th>
            <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Customer
            </th>
            <th className="text-left pb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Time
            </th>
            <th className="text-right pb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Amount
            </th>
            <th className="text-right pb-3 text-[10px] font-black uppercase tracking-widest text-stone-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNo} className="border-b border-stone-100 last:border-0">
              <td className="py-3 text-xs font-black text-[#25130b]">
                {order.orderNo}
              </td>
              <td className="py-3 text-xs font-medium text-stone-600">
                {order.customer}
              </td>
              <td className="py-3 text-xs font-medium text-stone-500">
                {order.time}
              </td>
              <td className="py-3 text-right text-xs font-black text-[#25130b] tabular-nums">
                ₱{order.amount.toLocaleString()}
              </td>
              <td className="py-3 text-right">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
