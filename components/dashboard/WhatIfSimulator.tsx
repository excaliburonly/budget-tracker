"use client";

import { useState } from "react";
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  LockClosedIcon, 
  ChevronRightIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import { runWhatIfSimulation } from "@/actions/ai";
import { formatCurrency } from "@/utils/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface SimulationResult {
  projection: { year: number; netWorth: number; liquid: number; invested: number }[];
  goalAnalysis: { goalName: string; projectedAchievementDate: string; isReached: boolean }[];
  insight: string;
  recommendation: string;
  error?: string;
  message?: string;
}

export default function WhatIfSimulator({ 
  subscriptionTier, 
  currency 
}: { 
  subscriptionTier: string; 
  currency: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [params, setParams] = useState({
    monthlyIncomeChange: 0,
    monthlyExpenseChange: 0,
    monthlyInvestmentChange: 0,
    years: 5
  });

  const isPremium = subscriptionTier === 'premium';

  const handleSimulate = async () => {
    if (!isPremium) return;
    setLoading(true);
    try {
      const res = await runWhatIfSimulation(params);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm overflow-hidden relative group">
      {/* Premium Overlay for Free Users */}
      {!isPremium && (
        <div className="absolute inset-0 bg-surface/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center transition-all group-hover:backdrop-blur-[4px]">
          <div className="bg-primary/10 p-4 rounded-3xl mb-4 border border-primary/20">
            <LockClosedIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Premium Feature</h3>
          <p className="text-sm text-text-muted max-w-xs font-medium mb-6">
            The What-If Simulator uses advanced AI to project your future wealth. Upgrade to Premium to unlock.
          </p>
          <button className="px-6 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl text-xs shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
            Unlock AI Simulation
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`space-y-8 ${!isPremium ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              What-If Simulator
            </h3>
            <p className="text-text-muted text-sm mt-1 font-medium">Project your wealth by changing your habits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4" />
                  Monthly Income Change
                </label>
                <span className={`text-sm font-bold ${params.monthlyIncomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {params.monthlyIncomeChange >= 0 ? '+' : ''}{formatCurrency(params.monthlyIncomeChange, currency)}
                </span>
              </div>
              <input 
                type="range" min="-50000" max="100000" step="1000"
                value={params.monthlyIncomeChange}
                onChange={(e) => setParams({...params, monthlyIncomeChange: parseInt(e.target.value)})}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <ShoppingCartIcon className="w-4 h-4" />
                  Monthly Expense Change
                </label>
                <span className={`text-sm font-bold ${params.monthlyExpenseChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {params.monthlyExpenseChange > 0 ? '+' : ''}{formatCurrency(params.monthlyExpenseChange, currency)}
                </span>
              </div>
              <input 
                type="range" min="-50000" max="50000" step="500"
                value={params.monthlyExpenseChange}
                onChange={(e) => setParams({...params, monthlyExpenseChange: parseInt(e.target.value)})}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <PresentationChartLineIcon className="w-4 h-4" />
                  Monthly Investment Change
                </label>
                <span className={`text-sm font-bold ${params.monthlyInvestmentChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {params.monthlyInvestmentChange >= 0 ? '+' : ''}{formatCurrency(params.monthlyInvestmentChange, currency)}
                </span>
              </div>
              <input 
                type="range" min="-20000" max="100000" step="500"
                value={params.monthlyInvestmentChange}
                onChange={(e) => setParams({...params, monthlyInvestmentChange: parseInt(e.target.value)})}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest">Simulation Horizon</label>
                <span className="text-sm font-bold text-primary">{params.years} Years</span>
              </div>
              <input 
                type="range" min="1" max="30" step="1"
                value={params.years}
                onChange={(e) => setParams({...params, years: parseInt(e.target.value)})}
                className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button 
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating Future...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Run AI Simulation
                </>
              )}
            </button>
          </div>

          {/* Results/Chart */}
          <div className="bg-background/40 rounded-3xl p-6 border border-surface-border/50 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
            {!result && !loading && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-text-muted/20" />
                </div>
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Adjust parameters and run simulation</p>
              </div>
            )}

            {result && (
              <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.projection}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" opacity={0.5} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--surface-border)'}}
                        formatter={(value) => [formatCurrency(Number(value), currency), ""]}
                      />
                      <Legend iconType="circle" />
                      <Line name="Net Worth" type="monotone" dataKey="netWorth" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                      <Line name="Invested" type="monotone" dataKey="invested" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Insights</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed font-medium italic">
                    &quot;{result.insight}&quot;
                  </p>
                  <div className="mt-3 pt-3 border-t border-primary/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Recommendation</p>
                     <p className="text-xs text-primary font-bold mt-1">{result.recommendation}</p>
                  </div>
                </div>

                {result.goalAnalysis.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Goal Tracker</p>
                    <div className="grid grid-cols-1 gap-2">
                      {result.goalAnalysis.map((goal, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-surface-border/30">
                          <span className="text-xs font-bold">{goal.goalName}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${goal.isReached ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {goal.isReached ? `Reached by ${goal.projectedAchievementDate}` : 'Not reached in horizon'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
