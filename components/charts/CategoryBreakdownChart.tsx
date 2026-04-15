"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface CategoryBreakdownChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  currency: string;
  title?: string;
}

const DEFAULT_COLORS = [
  '#2563eb', // blue-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export default function CategoryBreakdownChart({ data, currency, title }: CategoryBreakdownChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Filter out items with 0 or negative value and map colors
  const chartData = data
    .filter(item => item.value > 0)
    .map((item, index) => ({
      ...item,
      fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));

  if (!isMounted) return <div className="h-72 w-full animate-pulse bg-surface/50 rounded-lg" />;

  if (chartData.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center border border-dashed border-surface-border rounded-xl">
        <p className="text-sm text-text-muted">No data available for {title || "this period"}</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius="50%"
            outerRadius="75%"
            paddingAngle={5}
            dataKey="value"
            stroke="var(--surface)"
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--foreground)'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            formatter={(value: number | string | readonly (number | string)[] | undefined) => {
              const val = Array.isArray(value) ? value[0] : value;
              return [formatCurrency(Number(val || 0), currency), ""];
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
