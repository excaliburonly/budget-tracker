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

interface InvestmentPerformanceChartProps {
  data: { date: string; invested: number; value: number }[];
  currency: string;
}

export default function InvestmentPerformanceChart({ data, currency }: InvestmentPerformanceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="h-80 w-full bg-surface/50 animate-pulse rounded-[1.5rem]" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted font-medium italic">
        Not enough transaction history to generate performance chart.
      </div>
    );
  }

  const lastPoint = data[data.length - 1];
  const totalReturn = lastPoint.value - lastPoint.invested;
  const returnPercentage = lastPoint.invested > 0 ? (totalReturn / lastPoint.invested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-8 px-2">
        <div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Invested</p>
          <p className="text-xl font-black text-foreground">{formatCurrency(lastPoint.invested, currency)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Current Value</p>
          <p className="text-xl font-black text-foreground">{formatCurrency(lastPoint.value, currency)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Return</p>
          <p className={`text-xl font-black ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn, currency)}
            <span className="text-sm ml-1.5 opacity-80">({returnPercentage.toFixed(2)}%)</span>
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fontWeight: 700}} 
              minTickGap={30}
              tickFormatter={(str: string) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']} 
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--surface)', 
                borderRadius: '1.5rem', 
                border: '1px solid var(--surface-border)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ fontWeight: 800, marginBottom: '8px', fontSize: '12px' }}
              itemStyle={{ fontWeight: 700, fontSize: '12px', padding: '2px 0' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
              formatter={(value) => [formatCurrency(Number(value), currency), ""]}
            />
            <Legend 
                verticalAlign="top" 
                align="right" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Area 
              name="Market Value" 
              type="monotone" 
              dataKey="value" 
              stroke="var(--primary)" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
            <Area 
              name="Invested Amount" 
              type="monotone" 
              dataKey="invested" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
