"use client";

import { useState } from "react";
import { SparklesIcon, LightBulbIcon, ExclamationTriangleIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { generateFinancialInsights } from "@/actions/ai";

interface Insights {
  recap: string;
  anomalies: string[];
  optimizations: string[];
  error?: string;
}

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);
    try {
      const data = await generateFinancialInsights();
      setInsights(data);
    } catch {
      setInsights({
        recap: "",
        anomalies: [],
        optimizations: [],
        error: "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 via-surface to-surface p-8 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="relative flex flex-col items-stretch gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className={`p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 ${loading ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
            <SparklesIcon className={`w-10 h-10 text-primary ${loading ? 'animate-spin' : ''}`} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-2">
              AI Financial Insights
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                BETA
              </span>
            </h3>
            <p className="text-text-muted text-sm max-w-lg leading-relaxed">
              Get personalized analysis of your spending habits, anomaly detection, and smart suggestions to reach your savings goals faster.
            </p>
          </div>

          <div className="shrink-0">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {loading ? "Analyzing..." : "Generate Analysis"}
            </button>
          </div>
        </div>

        {insights && !insights.error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 bg-surface/50 rounded-xl border border-primary/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <ChartBarIcon className="w-5 h-5" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Monthly Recap</h4>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {insights.recap}
              </p>
            </div>

            <div className="p-5 bg-surface/50 rounded-xl border border-primary/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-amber-500">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Anomalies</h4>
              </div>
              <ul className="space-y-2">
                {insights.anomalies.length > 0 ? insights.anomalies.map((a, i) => (
                  <li key={i} className="text-sm text-text-muted flex gap-2">
                    <span className="text-amber-500">•</span> {a}
                  </li>
                )) : (
                  <li className="text-sm text-text-muted italic">No anomalies detected.</li>
                )}
              </ul>
            </div>

            <div className="p-5 bg-surface/50 rounded-xl border border-primary/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-500">
                <LightBulbIcon className="w-5 h-5" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Optimizations</h4>
              </div>
              <ul className="space-y-2">
                {insights.optimizations.length > 0 ? insights.optimizations.map((o, i) => (
                  <li key={i} className="text-sm text-text-muted flex gap-2">
                    <span className="text-emerald-500">→</span> {o}
                  </li>
                )) : (
                  <li className="text-sm text-text-muted italic">Add more data for suggestions.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {insights?.error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
            {insights.error}
          </div>
        )}
      </div>
    </div>
  );
}
