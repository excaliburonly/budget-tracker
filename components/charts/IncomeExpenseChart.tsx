"use client";

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
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
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
            fill="#10b981" // emerald-500
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
          <Bar 
            name="Expense" 
            dataKey="expense" 
            fill="#ef4444" // red-500
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
