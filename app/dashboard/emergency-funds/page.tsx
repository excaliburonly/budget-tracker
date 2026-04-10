"use client";

import { getEmergencyFunds } from "@/actions/emergency-funds";
import { AddEmergencyFundForm, EditEmergencyFundModal } from "@/components/forms/EmergencyFundForms";
import { EmergencyFundCard } from "@/components/dashboard/EmergencyFundCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { EmergencyFund } from "@/types/database";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function EmergencyFundsPage() {
    const [funds, setFunds] = useState<EmergencyFund[]>([]);
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(true);
    const [editingFund, setEditingFund] = useState<EmergencyFund | null>(null);

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user?.id)
            .single();

        setCurrency(profile?.currency || 'INR');

        const data = await getEmergencyFunds();
        setFunds(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchData();
        };
        init();
    }, [fetchData]);

    const refreshFunds = () => {
        fetchData();
    };

    if (loading) {
        return <div className="p-8 text-center text-text-muted">Loading funds...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <header className="mb-10 flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Emergency Funds & Goals</h1>
                    <p className="text-text-muted mt-1">Track your progress towards financial security and major life goals</p>
                </div>
            </header>

            <AddEmergencyFundForm onFundAdded={refreshFunds} />

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Your Active Funds</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {funds.length === 0 ? (
                        <div className="col-span-full bg-surface rounded-2xl border border-dashed border-input-border h-48 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-text-muted">No fund goals created yet.</p>
                            <p className="text-sm text-text-muted/60 mt-1">Start by creating your main emergency fund goal.</p>
                        </div>
                    ) : (
                        funds.map((fund) => (
                            <EmergencyFundCard
                                key={fund.id}
                                fund={fund}
                                currency={currency}
                                onEdit={setEditingFund}
                                onRefresh={refreshFunds}
                            />
                        ))
                    )}
                </div>
            </section>

            {editingFund && (
                <EditEmergencyFundModal
                    fund={editingFund}
                    onCloseAction={() => {
                        setEditingFund(null);
                        refreshFunds();
                    }}
                />
            )}
        </div>
    );
}
