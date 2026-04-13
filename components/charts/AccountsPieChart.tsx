"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface AccountsPieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  currency: string;
}

const COLORS = [
  '#2563eb', // blue-600 (primary)
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export default function AccountsPieChart({ data, currency }: AccountsPieChartProps) {
  // Filter out accounts with 0 or negative balance for the pie chart and add fill/stroke
  const chartData = data
    .filter(item => item.value > 0)
    .map((item, index) => ({
      ...item,
      fill: item.color || COLORS[index % COLORS.length]
    }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={0}
            outerRadius="65%"
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
