"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface DailyCategoryChartProps {
  data: Record<string, string | number>[];
  categories: { name: string; color: string }[];
  currency: string;
}

export default function DailyCategoryChart({ data, categories, currency }: DailyCategoryChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isMounted) return <div className="h-80 w-full animate-pulse bg-surface/50 rounded-lg" />;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            dy={10}
          />
          <YAxis 
            hide 
          />
          <Tooltip
            cursor={{ fill: 'var(--background)', opacity: 0.4 }}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--foreground)'
            }}
            formatter={(value: number | string | readonly (number | string)[] | undefined) => {
              const val = Array.isArray(value) ? value[0] : value;
              return [formatCurrency(Number(val || 0), currency), ""];
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }}
          />
          {categories.map((cat) => (
            <Bar
              key={cat.name}
              dataKey={cat.name}
              name={cat.name}
              stackId="a"
              fill={cat.color}
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
