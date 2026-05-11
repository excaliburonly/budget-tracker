"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  ChartBarIcon, 
  SparklesIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";

export default function AnalyticsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "general";

  const tabs = [
    { id: "general", name: "Standard", icon: ChartBarIcon },
    { id: "investments", name: "Investments", icon: PresentationChartLineIcon },
    { id: "ai", name: "AI Advisor", icon: SparklesIcon, isPremium: true },
  ];

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-surface/50 p-2 rounded-[2rem] border border-surface-border/50 w-fit mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all
              ${isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                : "text-text-muted hover:bg-background hover:text-foreground"
              }
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-text-muted"}`} />
            {tab.name}
            {tab.isPremium && !isActive && (
              <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md ml-1">
                AI
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
