"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";

export default function AIInsights() {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-surface to-surface p-8 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 animate-pulse">
          <SparklesIcon className="w-10 h-10 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-2">
            AI Financial Insights
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
              Coming Soon
            </span>
          </h3>
          <p className="text-text-muted text-sm max-w-lg leading-relaxed">
            Get personalized analysis of your spending habits, anomaly detection, and smart suggestions to reach your savings goals faster. Our AI is currently being trained to better understand your financial patterns.
          </p>
        </div>

        <div className="shrink-0">
          <button 
            disabled 
            className="px-6 py-3 bg-primary/50 text-white font-bold rounded-xl cursor-not-allowed opacity-70 transition-all"
          >
            Generate Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
