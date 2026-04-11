"use client";

import { AddInvestmentForm, EditInvestmentModal } from "@/components/forms/InvestmentForms";
import { InvestmentCard } from "@/components/dashboard/InvestmentCard";
import { Investment } from "@/types/database";
import { useState } from "react";
import { ChartBarSquareIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

export default function InvestmentsPage() {
    const { 
        investments, 
        currency, 
        loading, 
        refreshInvestments 
    } = useDashboard();
    
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading investments...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ChartBarSquareIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Investments</h1>
                    <p className="text-text-muted mt-1">Grow your wealth over time</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {investments.map((investment) => (
                            <InvestmentCard
                                key={investment.id}
                                investment={investment}
                                currency={currency}
                                onEdit={() => setEditingInvestment(investment)}
                                onRefresh={refreshInvestments}
                            />
                        ))}
                    </div>
                    {investments.length === 0 && (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-input-border">
                            <p className="text-text-muted">No investments added yet.</p>
                        </div>
                    )}
                </div>

                <div>
                    <AddInvestmentForm onInvestmentAdded={refreshInvestments} />
                </div>
            </div>

            {editingInvestment && (
                <EditInvestmentModal
                    investment={editingInvestment}
                    onClose={() => setEditingInvestment(null)}
                    onInvestmentUpdated={() => {
                        refreshInvestments();
                        setEditingInvestment(null);
                    }}
                />
            )}
        </div>
    );
}
