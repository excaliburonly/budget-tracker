"use client";

import { AddEmergencyFundForm, EditEmergencyFundModal } from "@/components/forms/EmergencyFundForms";
import { EmergencyFundCard } from "@/components/dashboard/EmergencyFundCard";
import { EmergencyFund } from "@/types/database";
import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

export default function EmergencyFundsPage() {
    const { 
        emergencyFunds, 
        currency, 
        loading, 
        refreshEmergencyFunds 
    } = useDashboard();
    
    const [editingFund, setEditingFund] = useState<EmergencyFund | null>(null);

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading emergency funds...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Emergency Funds</h1>
                    <p className="text-text-muted mt-1">Peace of mind for life&lsquo;s unexpected turns</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {emergencyFunds.map((fund) => (
                            <EmergencyFundCard
                                key={fund.id}
                                fund={fund}
                                currency={currency}
                                onEdit={() => setEditingFund(fund)}
                                onRefresh={refreshEmergencyFunds}
                            />
                        ))}
                    </div>
                    {emergencyFunds.length === 0 && (
                        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-input-border">
                            <p className="text-text-muted">No emergency funds added yet.</p>
                        </div>
                    )}
                </div>

                <div>
                    <AddEmergencyFundForm onFundAdded={refreshEmergencyFunds} />
                </div>
            </div>

            {editingFund && (
                <EditEmergencyFundModal
                    fund={editingFund}
                    onClose={() => setEditingFund(null)}
                    onFundUpdated={() => {
                        refreshEmergencyFunds();
                        setEditingFund(null);
                    }}
                />
            )}
        </div>
    );
}
