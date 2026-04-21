"use client";

import { useState, useEffect } from "react";
import { SparklesIcon, LightBulbIcon, ExclamationTriangleIcon, ChartBarIcon, BookmarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { generateFinancialInsights, saveFinancialInsight, getSavedInsights } from "@/actions/ai";

interface Insights {
  recap: string;
  anomalies: string[];
  optimizations: string[];
  error?: string;
}

interface SavedInsight {
  id: string;
  month: string;
  insight_data: Insights;
  created_at: string;
}

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [history, setHistory] = useState<SavedInsight[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const data = await getSavedInsights();
    setHistory(data as SavedInsight[]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setInsights(null);
    setSaved(false);
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

  const handleSave = async () => {
    if (!insights || saved) return;
    setSaving(true);
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await saveFinancialInsight(month, insights);
      if (res.success) {
        setSaved(true);
        fetchHistory();
      } else {
        alert("Failed to save: " + res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 via-surface to-surface p-8 rounded-[2.5rem] border border-primary/20 shadow-sm relative overflow-hidden group">
        {/* Decorative background elements */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

        <div className="relative flex flex-col items-stretch gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className={`p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 ${loading ? 'animate-pulse scale-110' : ''} transition-all duration-500`}>
              <SparklesIcon className={`w-10 h-10 text-primary ${loading ? 'animate-spin' : ''}`} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-black text-foreground mb-2 flex items-center justify-center md:justify-start gap-2 tracking-tight">
                AI Financial Insights
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                  BETA
                </span>
              </h3>
              <p className="text-text-muted text-sm max-w-lg leading-relaxed font-medium">
                Get personalized analysis of your spending habits, anomaly detection, and smart suggestions to reach your savings goals faster.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-5 py-3 bg-surface border border-surface-border text-text-muted font-bold rounded-xl hover:bg-background transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ClockIcon className="w-5 h-5" />
                {showHistory ? "Hide History" : "History"}
              </button>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`px-6 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-xs ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {loading ? "Analyzing..." : "Generate Analysis"}
              </button>
            </div>
          </div>

          {insights && !insights.error && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-surface/50 rounded-3xl border border-primary/10 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <ChartBarIcon className="w-5 h-5" />
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">Monthly Recap</h4>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed font-medium">
                    {insights.recap}
                  </p>
                </div>

                <div className="p-6 bg-surface/50 rounded-3xl border border-primary/10 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[var(--warning)]">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">Anomalies</h4>
                  </div>
                  <ul className="space-y-3">
                    {insights.anomalies.length > 0 ? insights.anomalies.map((a, i) => (
                      <li key={i} className="text-sm text-text-muted flex gap-2 font-medium">
                        <span className="text-[var(--warning)]">•</span> {a}
                      </li>
                    )) : (
                      <li className="text-sm text-text-muted italic font-medium">No anomalies detected.</li>
                    )}
                  </ul>
                </div>

                <div className="p-6 bg-surface/50 rounded-3xl border border-primary/10 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[var(--success)]">
                    <LightBulbIcon className="w-5 h-5" />
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">Optimizations</h4>
                  </div>
                  <ul className="space-y-3">
                    {insights.optimizations.length > 0 ? insights.optimizations.map((o, i) => (
                      <li key={i} className="text-sm text-text-muted flex gap-2 font-medium">
                        <span className="text-[var(--success)]">→</span> {o}
                      </li>
                    )) : (
                      <li className="text-sm text-text-muted italic font-medium">Add more data for suggestions.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    saved 
                      ? 'bg-[var(--success)] text-white cursor-default' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4" />
                  {saving ? "Saving..." : saved ? "Saved to History" : "Save this Analysis"}
                </button>
              </div>
            </div>
          )}

          {insights?.error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-bold">
              {insights.error}
            </div>
          )}
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2 px-2">
            <ClockIcon className="w-5 h-5 text-primary" />
            Saved Analysis History
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div key={item.id} className="bg-surface/50 p-6 rounded-3xl border border-surface-border/50 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                    <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-muted line-clamp-3 font-medium leading-relaxed">
                  {item.insight_data.recap}
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="flex -space-x-2">
                    {item.insight_data.anomalies.length > 0 && (
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center" title="Has Anomalies">
                        <ExclamationTriangleIcon className="w-3 h-3 text-amber-600" />
                      </div>
                    )}
                    {item.insight_data.optimizations.length > 0 && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center" title="Has Suggestions">
                        <LightBulbIcon className="w-3 h-3 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setInsights(item.insight_data);
                      setSaved(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="ml-auto text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
