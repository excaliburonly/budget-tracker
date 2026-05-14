"use client";

import { addSIP, logSIPTransaction, updateSIP, deleteSIP } from "@/actions/sips";
import { Investment, Account, SIP } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";
import { PlusIcon, BanknotesIcon, TrashIcon } from "@heroicons/react/24/outline";

export function AddSIPForm({ investments, onAddedAction }: { investments: Investment[], onAddedAction?: () => void }) {
    const { setIsSaving } = useDashboard();
    
    return (
        <form action={async (formData) => {
            setIsSaving(true);
            try {
                const res = await addSIP(formData);
                if (res.error) alert(res.error);
                else if (onAddedAction) onAddedAction();
            } finally {
                setIsSaving(false);
            }
        }} className="space-y-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Mutual Fund Investment</label>
                <select name="investment_id" className="px-4 py-2 rounded-lg border bg-background" required>
                    <option value="">Select Investment</option>
                    {investments.filter(i => i.investment_type === 'Mutual Fund').map(i => (
                        <option key={i.id} value={i.id}>{i.asset_name}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Monthly/Weekly Amount</label>
                <input type="number" name="amount" step="0.01" className="px-4 py-2 rounded-lg border bg-background" required />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Frequency</label>
                <select name="frequency" className="px-4 py-2 rounded-lg border bg-background" required>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Next SIP Date</label>
                <input type="date" name="next_date" className="px-4 py-2 rounded-lg border bg-background" required />
            </div>
            <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5" /> Create SIP
            </button>
        </form>
    );
}

export function LogSIPPaymentForm({ sip, accounts, onLoggedAction }: { sip: SIP, accounts: Account[], onLoggedAction?: () => void }) {
    const { setIsSaving } = useDashboard();
    
    return (
        <form action={async (formData) => {
            setIsSaving(true);
            try {
                const res = await logSIPTransaction(sip.id, formData);
                if (res.error) alert(res.error);
                else if (onLoggedAction) onLoggedAction();
            } finally {
                setIsSaving(false);
            }
        }} className="space-y-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Amount Paid</label>
                <input type="number" name="amount" step="0.01" defaultValue={sip.amount} className="px-4 py-2 rounded-lg border bg-background" required />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Units Allotted</label>
                <input type="number" name="quantity" step="0.0001" className="px-4 py-2 rounded-lg border bg-background" placeholder="e.g. 125.45" required />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Payment Account</label>
                <select name="account_id" className="px-4 py-2 rounded-lg border bg-background" required>
                    <option value="">Select Account</option>
                    {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} (Bal: {a.balance})</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-4 grid grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Date</label>
                    <input type="date" name="date" defaultValue={new Date().toLocaleDateString('en-CA')} className="px-4 py-2 rounded-lg border bg-background" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Time</label>
                    <input type="time" name="time" defaultValue={new Date().toTimeString().slice(0, 5)} className="px-4 py-2 rounded-lg border bg-background" required />
                </div>
            </div>
            <input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <BanknotesIcon className="w-5 h-5" /> Log SIP Payment
            </button>
        </form>
    );
}

export function EditSIPForm({ sip, onUpdatedAction, onDeletedAction }: { sip: SIP, onUpdatedAction?: () => void, onDeletedAction?: () => void }) {
    const { setIsSaving } = useDashboard();

    return (
        <div className="space-y-6">
            <form action={async (formData) => {
                setIsSaving(true);
                try {
                    const res = await updateSIP(sip.id, formData);
                    if (res.error) alert(res.error);
                    else if (onUpdatedAction) onUpdatedAction();
                } finally {
                    setIsSaving(false);
                }
            }} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/70 uppercase text-[10px] tracking-widest">Installment Amount</label>
                    <input type="number" name="amount" step="0.01" defaultValue={sip.amount} className="px-4 py-2 rounded-lg border bg-background" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/70 uppercase text-[10px] tracking-widest">Frequency</label>
                    <select name="frequency" defaultValue={sip.frequency} className="px-4 py-2 rounded-lg border bg-background" required>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="quarterly">Quarterly</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/70 uppercase text-[10px] tracking-widest">Next SIP Date</label>
                    <input type="date" name="next_date" defaultValue={sip.next_date} className="px-4 py-2 rounded-lg border bg-background" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/70 uppercase text-[10px] tracking-widest">Status</label>
                    <select name="status" defaultValue={sip.status} className="px-4 py-2 rounded-lg border bg-background" required>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold">
                    Update SIP Settings
                </button>
            </form>

            <div className="pt-4 border-t border-surface-border">
                <button 
                    onClick={async () => {
                        if (confirm("Are you sure you want to stop tracking this SIP?")) {
                            setIsSaving(true);
                            try {
                                await deleteSIP(sip.id);
                                if (onDeletedAction) onDeletedAction();
                            } finally {
                                setIsSaving(false);
                            }
                        }
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" /> Delete SIP Tracker
                </button>
            </div>
        </div>
    );
}
