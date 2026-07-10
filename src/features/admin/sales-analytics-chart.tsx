"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

export type SalesPoint = {
  label: string;
  revenue: number;
  orders: number;
};

export type SalesSeries = {
  today: SalesPoint[];
  week: SalesPoint[];
  month: SalesPoint[];
};

const ranges = [
  { key: "today", label: "Today" },
  { key: "week", label: "7D" },
  { key: "month", label: "30D" },
] as const;

const metrics = [
  { key: "revenue", label: "Revenue" },
  { key: "orders", label: "Orders" },
] as const;

type RangeKey = (typeof ranges)[number]["key"];
type MetricKey = (typeof metrics)[number]["key"];

function formatPesoShort(value: number) {
  if (value >= 1000) return `₱${(value / 1000).toFixed(1)}k`;
  return `₱${value.toLocaleString()}`;
}

export function SalesAnalyticsChart({ series }: { series: SalesSeries }) {
  const [range, setRange] = useState<RangeKey>("today");
  const [metric, setMetric] = useState<MetricKey>("revenue");

  const data = series[range];

  const totals = useMemo(
    () => ({
      revenue: data.reduce((sum, point) => sum + point.revenue, 0),
      orders: data.reduce((sum, point) => sum + point.orders, 0),
    }),
    [data],
  );

  return (
    <div>
      {/* Header: title + live summary on the left, filters on the right */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
            Sales Analytics
          </h2>
          <p className="mt-1.5 text-2xl font-black text-[#25130b] tabular-nums">
            {metric === "revenue"
              ? `₱${totals.revenue.toLocaleString()}`
              : totals.orders.toLocaleString()}
            <span className="ml-2 text-xs font-bold text-orange-950/40">
              {metric === "revenue"
                ? `${totals.orders} order${totals.orders !== 1 ? "s" : ""}`
                : `₱${totals.revenue.toLocaleString()} revenue`}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range — segmented pill */}
          <div className="flex items-center gap-0.5 rounded-full bg-orange-950/[0.05] p-0.5">
            {ranges.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                aria-pressed={range === key}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200",
                  range === key
                    ? "bg-white text-[#25130b] shadow-sm"
                    : "text-orange-950/45 hover:text-[#25130b]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Metric — segmented pill */}
          <div className="flex items-center gap-0.5 rounded-full bg-orange-950/[0.05] p-0.5">
            {metrics.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                aria-pressed={metric === key}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200",
                  metric === key
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-orange-950/45 hover:text-[#25130b]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe9df" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#a8a29e" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
              allowDecimals={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: "#a8a29e" }}
              tickFormatter={(value: number) =>
                metric === "revenue" ? formatPesoShort(value) : String(value)
              }
            />
            <Tooltip
              cursor={{ stroke: "#dc2626", strokeOpacity: 0.25 }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid rgba(120,53,15,0.12)",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(120,53,15,0.10)",
                padding: "10px 14px",
              }}
              labelStyle={{ fontWeight: 700, color: "#25130b", fontSize: 12 }}
              itemStyle={{ fontWeight: 700, color: "#b91c1c", fontSize: 13 }}
              formatter={(value) => [
                metric === "revenue"
                  ? `₱${Number(value).toLocaleString()}`
                  : `${Number(value).toLocaleString()} order${Number(value) !== 1 ? "s" : ""}`,
                metric === "revenue" ? "Revenue" : "Orders",
              ]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#dc2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillMetric)"
              animationDuration={450}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
