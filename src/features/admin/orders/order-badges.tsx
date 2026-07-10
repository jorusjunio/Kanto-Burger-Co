import { Badge } from "@/components/ui/badge";

type BadgeProps = {
  value: string;
};

export function OrderStatusBadge({ value }: BadgeProps) {
  const className =
    value === "CANCELLED"
      ? "border-red-200 bg-red-50 text-red-700"
      : value === "COMPLETED"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : value === "READY"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <Badge variant="outline" className={className}>
      {value.replaceAll("_", " ")}
    </Badge>
  );
}

// Payment PENDING means "GCash reference submitted, awaiting verification" — it
// only occurs for GCash. Relabel + recolor (blue) so it never reads like the
// amber kitchen "Pending" order status, which means something entirely different.
const paymentBadgeLabels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Awaiting GCash",
  UNPAID: "Unpaid",
};

export function PaymentStatusBadge({ value }: BadgeProps) {
  const className =
    value === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "PENDING"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <Badge variant="outline" className={className}>
      {paymentBadgeLabels[value] ?? value}
    </Badge>
  );
}
