"use client";

import { SIP, Account } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { useState } from "react";
import { LogSIPPaymentForm, EditSIPForm } from "@/components/forms/SIPForms";
import { CalendarIcon, BanknotesIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export function SIPCard({ sip, accounts, currency }: { sip: SIP, accounts: Account[], currency: string }) {
    const [showLogModal, setShowLogModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const isDue = new Date(sip.next_date) <= new Date();

    return (
        <div className="bg-surface/50 backdrop-blur-sm p-6 rounded-3xl border border-surface-border hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-foreground text-lg">{sip.investments?.asset_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            sip.status === 'active' ? 'bg-green-100 text-green-700' :
                            sip.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {sip.status}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-surface-border">
                            {sip.frequency}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowEditModal(true)}
                    className="p-2 hover:bg-surface rounded-xl text-text-muted hover:text-primary transition-colors"
                >
                    <Cog6ToothIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface rounded-2xl border border-surface-border/50">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-xl font-black text-foreground">{formatCurrency(sip.amount, currency)}</p>
                </div>
                <div className="p-3 bg-surface rounded-2xl border border-surface-border/50">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Next Date</p>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className={`w-4 h-4 ${isDue ? 'text-red-500' : 'text-text-muted'}`} />
                        <p className={`text-sm font-bold ${isDue ? 'text-red-500' : 'text-foreground'}`}>
                            {new Date(sip.next_date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setShowLogModal(true)}
                disabled={sip.status !== 'active'}
                className="w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <BanknotesIcon className="w-4 h-4" /> Log SIP Payment
            </button>

            {showLogModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-surface p-8 rounded-[2.5rem] border border-surface-border shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black tracking-tight">Log SIP Payment</h3>
                            <button onClick={() => setShowLogModal(false)} className="text-text-muted">✕</button>
                        </div>
                        <LogSIPPaymentForm 
                            sip={sip} 
                            accounts={accounts} 
                            onLoggedAction={() => setShowLogModal(false)} 
                        />
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-surface p-8 rounded-[2.5rem] border border-surface-border shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black tracking-tight">Edit SIP Tracking</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-text-muted">✕</button>
                        </div>
                        <EditSIPForm 
                            sip={sip} 
                            onUpdatedAction={() => setShowEditModal(false)}
                            onDeletedAction={() => setShowEditModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
