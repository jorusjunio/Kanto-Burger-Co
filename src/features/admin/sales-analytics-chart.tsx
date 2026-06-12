"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesAnalyticsChartProps {
  data?: Array<{
    time: string;
    sales: number;
  }>;
}

export function SalesAnalyticsChart({ data }: SalesAnalyticsChartProps) {
  // Mock data for now - will be replaced with actual data
  const chartData = data || [
    { time: "6AM", sales: 1200 },
    { time: "8AM", sales: 2800 },
    { time: "10AM", sales: 4500 },
    { time: "12PM", sales: 7200 },
    { time: "2PM", sales: 8900 },
    { time: "4PM", sales: 11200 },
    { time: "6PM", sales: 15420 },
  ];

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 500, fill: "#78716c" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 500, fill: "#78716c" }}
            tickFormatter={(value) => `₱${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e7e5e4",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
            itemStyle={{ fontWeight: 600, color: "#292524" }}
            formatter={(value: number) => [`₱${value.toLocaleString()}`, "Sales"]}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#dc2626"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
