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
        return "bg-red-700/8 text-red-700";
      case "PREPARING":
        return "bg-amber-500/10 text-amber-700";
      case "READY":
        return "bg-emerald-600/8 text-emerald-700";
      case "OUT_FOR_DELIVERY":
        return "bg-sky-500/10 text-sky-700";
      case "COMPLETED":
        return "bg-orange-950/5 text-orange-950/55";
      case "CANCELLED":
        return "bg-orange-950/5 text-orange-950/40 line-through";
      default:
        return "bg-orange-950/5 text-orange-950/55";
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
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}
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
