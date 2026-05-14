"use client";

import { AIInvestmentAdvisor } from "@/components/dashboard/AIInvestmentAdvisor";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function InvestmentAdvisorPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <SparklesIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">AI Investment Advisor</h1>
                        <p className="text-text-muted mt-1 font-medium">Personalized strategic guidance for your wealth growth</p>
                    </div>
                </div>
            </header>

            <div className="animate-fade-in">
                <AIInvestmentAdvisor />
            </div>
        </div>
    );
}
