"use client";

import { useState } from "react";
import { generateFinancialHealthReport } from "@/actions/ai";
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  MinusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";

interface HealthReport {
  title: string;
  summary: string;
  wins: string[];
  concerns: string[];
  metrics: {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
    description: string;
  }[];
  strategicAdvice: string;
  error?: string;
}

export default function FinancialHealthReport() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateFinancialHealthReport();
      if (result.error) {
        setError(result.error);
      } else {
        setReport(result);
        setIsOpen(true);
      }
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />;
      case "down": return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <MinusIcon className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <SparklesIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Financial Health Report</h3>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Comprehensive &ldquo;State of the Union&rdquo;</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Analyzing Data...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {report && (
        <div className="bg-surface/80 backdrop-blur-sm rounded-[2.5rem] border border-surface-border/50 shadow-xl overflow-hidden animate-fade-in-up">
          <div 
            className="p-8 border-b border-surface-border/30 flex justify-between items-center cursor-pointer hover:bg-background/20 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div>
              <h4 className="text-2xl font-black text-foreground tracking-tight">{report.title}</h4>
              <p className="text-sm text-text-muted mt-1">{report.summary}</p>
            </div>
            {isOpen ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
          </div>

          {isOpen && (
            <div className="p-8 space-y-10">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {report.metrics.map((metric, i) => (
                  <div key={i} className="p-6 bg-background/50 rounded-3xl border border-surface-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{metric.label}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-2xl font-black text-foreground mb-1">{metric.value}</div>
                    <p className="text-[10px] text-text-muted font-bold leading-relaxed">{metric.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Wins */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Key Wins
                  </h5>
                  <ul className="space-y-3">
                    {report.wins.map((win, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-foreground leading-relaxed">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {win}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    Areas for Focus
                  </h5>
                  <ul className="space-y-3">
                    {report.concerns.map((concern, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-foreground leading-relaxed">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4">
                <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5" />
                  Strategic Next Step
                </h5>
                <p className="text-lg font-bold text-foreground leading-relaxed tracking-tight italic">
                  &ldquo;{report.strategicAdvice}&rdquo;
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => window.print()}
                  className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowTrendingDownIcon className="w-4 h-4 rotate-180" />
                  Print / Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
