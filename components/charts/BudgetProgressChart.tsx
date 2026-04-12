"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface BudgetProgressChartProps {
  data: {
    name: string;
    spent: number;
    amount: number;
  }[];
  currency: string;
}

export default function BudgetProgressChart({ data, currency }: BudgetProgressChartProps) {
  // Sort data by amount descending
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--surface-border)" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            width={80}
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
            formatter={(value: number | string | readonly (number | string)[] | undefined, name: string | number | undefined) => {
              const val = Array.isArray(value) ? value[0] : value;
              return [
                formatCurrency(Number(val || 0), currency), 
                name === 'spent' ? 'Spent' : 'Budget'
              ];
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
          />
          <Bar 
            name="Budget" 
            dataKey="amount" 
            fill="var(--background)" 
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
          <Bar 
            name="Spent" 
            dataKey="spent" 
            radius={[0, 4, 4, 0]}
            barSize={20}
            shape={(props: any) => {
              const { spent, amount } = props.payload;
              const isOver = spent > amount;
              const isClose = spent > amount * 0.9;
              const fill = isOver ? '#ef4444' : isClose ? '#f59e0b' : 'var(--primary)';
              return <Rectangle {...props} fill={fill} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
