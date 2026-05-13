"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface NetWorthChartProps {
  data: {
    month: string;
    liquid_cash: number;
    invested_value: number;
    total_net_worth: number;
  }[];
  currency: string;
}

export default function NetWorthChart({ data, currency }: NetWorthChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return <div className="h-80 w-full animate-pulse bg-surface/50 rounded-[2rem]" />;

  // Sort data by month to ensure correct time-series
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));

  // Format month for display (e.g., '2026-05' -> 'May 26')
  const chartData = sortedData.map(d => {
    const [year, month] = d.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      ...d,
      displayName: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    };
  });

  return (
    <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight">Net Worth Trend</h3>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Growth of your total wealth over time</p>
        </div>
      </div>

      <div className="h-80 w-full" style={{ minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
            <XAxis 
              dataKey="displayName" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }}
              dy={15}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ stroke: 'var(--primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                const val = Array.isArray(value) ? value[0] : value;
                return [formatCurrency(Number(val || 0), currency), ""];
              }}
              labelStyle={{ fontWeight: 'black', marginBottom: '8px', color: 'var(--foreground)', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Area 
              type="monotone"
              name="Invested" 
              dataKey="invested_value" 
              stackId="1"
              stroke="var(--indigo-500)" 
              fill="var(--indigo-500)" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone"
              name="Liquid Cash" 
              dataKey="liquid_cash" 
              stackId="1"
              stroke="var(--success)" 
              fill="var(--success)" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone"
              name="Total Net Worth" 
              dataKey="total_net_worth" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
