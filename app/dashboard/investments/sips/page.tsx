"use client";

import { useDashboard } from "@/providers/dashboard-provider";
import { SIPCard } from "@/components/dashboard/SIPCard";
import { AddSIPForm } from "@/components/forms/SIPForms";
import { useState, useEffect } from "react";
import { getSIPs } from "@/actions/sips";
import { SIP } from "@/types/database";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { LoadingSpinner } from "@/components/theme/Loading";

export default function SIPSPage() {
    const { investments, accounts, profile } = useDashboard();
    const [sips, setSips] = useState<SIP[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        getSIPs().then(data => {
            setSips(data);
            setIsLoading(false);
        });
    }, []);

    const refreshSIPs = async () => {
        const data = await getSIPs();
        setSips(data);
    };

    if (isLoading) return <div className="p-20"><LoadingSpinner label="Loading SIPs..." /></div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/investments" className="p-2 hover:bg-surface rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">SIP Dashboard</h1>
                        <p className="text-text-muted font-medium">Track and log your recurring mutual fund investments</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <PlusIcon className="w-5 h-5" /> Add New SIP
                </button>
            </div>

            {sips.length === 0 ? (
                <div className="bg-surface/50 border border-dashed border-surface-border rounded-[2.5rem] p-12 text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PlusIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No SIPs Tracked Yet</h3>
                    <p className="text-text-muted mb-8 max-w-md mx-auto">
                        Link your mutual fund investments to start tracking your monthly or weekly systematic investments.
                    </p>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                    >
                        Set Up Your First SIP
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sips.map(sip => (
                        <SIPCard 
                            key={sip.id} 
                            sip={sip} 
                            accounts={accounts} 
                            currency={profile?.currency || "INR"} 
                        />
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-surface p-8 rounded-[2.5rem] border border-surface-border shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black tracking-tight">Set Up SIP Tracker</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-text-muted">✕</button>
                        </div>
                        <AddSIPForm 
                            investments={investments} 
                            onAddedAction={() => {
                                setShowAddModal(false);
                                refreshSIPs();
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
