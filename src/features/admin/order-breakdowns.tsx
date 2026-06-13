"use client";

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface OrderBreakdownsProps {
  orderTypes?: BreakdownItem[];
  paymentMethods?: BreakdownItem[];
}

export function OrderBreakdowns({ orderTypes, paymentMethods }: OrderBreakdownsProps) {
  const orderTypesData = orderTypes || [
    { label: "Pickup", value: 65, color: "bg-red-500" },
    { label: "Delivery", value: 35, color: "bg-amber-500" },
  ];

  const paymentMethodsData = paymentMethods || [
    { label: "Cash", value: 45, color: "bg-emerald-500" },
    { label: "GCash", value: 55, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Order Types Breakdown */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">
          Order Types
        </h3>
        <div className="space-y-3">
          {orderTypesData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-stone-700">{item.label}</span>
                <span className="text-xs font-black text-[#25130b] tabular-nums">{item.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-3">
          Payment Methods
        </h3>
        <div className="space-y-3">
          {paymentMethodsData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-stone-700">{item.label}</span>
                <span className="text-xs font-black text-[#25130b] tabular-nums">{item.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
