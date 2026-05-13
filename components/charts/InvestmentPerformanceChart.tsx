"use client";

import { useState, useEffect, useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/utils/format";

interface InvestmentPerformanceChartProps {
  data: { date: string; invested: number; value: number }[];
  currency: string;
  height?: number | string;
}

interface PayloadItem {
  dataKey: string | number | undefined;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
  currency: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload.find((p) => p.dataKey === "value")?.value || 0;
    const invested = payload.find((p) => p.dataKey === "invested")?.value || 0;
    const profit = value - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

    return (
      <div className="bg-surface/90 backdrop-blur-md border border-surface-border p-4 rounded-2xl shadow-2xl min-w-[200px] animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 pb-2 border-b border-surface-border/50">
          {label
            ? new Date(label).toLocaleDateString(undefined, {
                dateStyle: "long",
              })
            : "N/A"}
        </p>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-text-muted">
                Market Value
              </span>
            </div>
            <span className="text-sm font-black text-foreground">
              {formatCurrency(value, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-bold text-text-muted">
                Invested
              </span>
            </div>
            <span className="text-sm font-bold text-foreground/80">
              {formatCurrency(invested, currency)}
            </span>
          </div>
          <div className="pt-2 mt-1 border-t border-surface-border/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
              Net Return
            </span>
            <span
              className={`text-xs font-black ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {profit >= 0 ? "+" : ""}
              {formatCurrency(profit, currency)} ({profitPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvestmentPerformanceChart({
  data,
  currency,
  height = 320,
}: InvestmentPerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full bg-surface/50 animate-pulse rounded-[1.5rem]"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-text-muted font-medium italic"
      >
        Not enough transaction history to generate performance chart.
      </div>
    );
  }

  const lastPoint = data[data.length - 1];
  const totalReturn = lastPoint.value - lastPoint.invested;
  const returnPercentage =
    lastPoint.invested > 0 ? (totalReturn / lastPoint.invested) * 100 : 0;

  return (
    <div className="space-y-6 w-full overflow-hidden">
      <div className="flex flex-wrap gap-x-12 gap-y-4 px-2">
        <div className="transition-transform hover:scale-105 duration-300">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 opacity-70">
            Total Invested
          </p>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(lastPoint.invested, currency)}
          </p>
        </div>
        <div className="transition-transform hover:scale-105 duration-300">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 opacity-70">
            Current Value
          </p>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(lastPoint.value, currency)}
          </p>
        </div>
        <div className="transition-transform hover:scale-105 duration-300">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 opacity-70">
            Total Return
          </p>
          <p
            className={`text-2xl font-black ${totalReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {totalReturn >= 0 ? "+" : ""}
            {formatCurrency(totalReturn, currency)}
            <span className="text-xs ml-2 opacity-80 font-bold bg-current/10 px-2 py-0.5 rounded-full">
              {returnPercentage.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>

      <div style={{ height }} className="w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`colorValue-${id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id={`colorInvested-${id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--surface-border)"
              opacity={0.4}
            />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: "var(--surface-border)", strokeWidth: 1 }}
              tickLine={false}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 700,
              }}
              minTickGap={40}
              tickFormatter={(str: string) =>
                new Date(str).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
              dy={10}
            />
            <YAxis
              axisLine={{ stroke: "var(--surface-border)", strokeWidth: 1 }}
              tickLine={false}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 700,
              }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value;
              }}
              width={45}
              domain={["dataMin - 100", "auto"]}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={40}
              iconType="circle"
              wrapperStyle={{
                fontWeight: 800,
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                paddingBottom: "20px",
              }}
            />
            <Area
              name="Market Value"
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#colorValue-${id})`}
              animationDuration={1500}
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
            />
            <Area
              name="Invested Amount"
              type="monotone"
              dataKey="invested"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill={`url(#colorInvested-${id})`}
              animationDuration={1500}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#94a3b8" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
