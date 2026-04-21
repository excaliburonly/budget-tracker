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

interface IncomeExpenseChartProps {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
  currency: string;
}

export default function IncomeExpenseChart({ data, currency }: IncomeExpenseChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure container dimensions are calculated
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="h-64 w-full animate-pulse bg-surface/50 rounded-lg" />;

  return (
    <div className="h-64 w-full" style={{ minHeight: '256px' }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={256}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
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
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
          />
          <Bar 
            name="Income" 
            dataKey="income" 
            fill="var(--success)" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
          <Bar 
            name="Expense" 
            dataKey="expense" 
            fill="var(--error)" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
