"use client";

import { ChangeEvent, useState } from "react";
import { addCategory, addTransaction, deleteCategory, updateCategory, updateTransaction } from "@/actions/transactions";
import { suggestTransactionCategory } from "@/actions/ai";
import { Category, Transaction } from "@/types/database";
import { 
    PencilSquareIcon, 
    TrashIcon, 
    ArrowsRightLeftIcon, 
    ChartPieIcon,
    SparklesIcon 
} from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";
import { useEffect } from "react";
import { getExchangeRate } from "@/utils/exchange-rates";

export function AddTransactionForm({ onTransactionAddedAction }: { onTransactionAddedAction?: () => void }) {
    const { categories, accounts, refreshTransactions, setIsSaving, profile } = useDashboard();
    const [type, setType] = useState<"income" | "expense" | "transfer" | "investment">("expense");
    const [notes, setNotes] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [fromAccountId, setFromAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [exchangeRate, setExchangeRate] = useState<number>(83.5);
    const [isFetchingRate, setIsFetchingRate] = useState(false);

    const isPremium = profile?.subscription_tier === 'premium';

    const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value as "income" | "expense" | "transfer" | "investment");
        setCategoryId(""); // Reset category when type changes
    };

    const handleSuggestCategory = async () => {
        if (!notes || notes.length < 2 || type === 'transfer' || !isPremium) return;
        
        setIsSuggesting(true);
        try {
            const result = await suggestTransactionCategory(notes, type);
            if (result && typeof result === 'object' && 'error' in result) {
                alert(result.message);
                return;
            }
            if (typeof result === 'string') {
                setCategoryId(result);
            }
        } catch (error) {
            console.error("Suggestion failed:", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);
    const isInternational = fromAccount?.type === 'International Stock Wallet';

    // Fetch exchange rate automatically when account changes
    useEffect(() => {
        if (isInternational && fromAccount?.secondary_currency) {
            const fetchRate = async () => {
                setIsFetchingRate(true);
                const rate = await getExchangeRate(fromAccount.secondary_currency!, profile?.currency || 'INR');
                setExchangeRate(rate);
                setIsFetchingRate(false);
            };
            fetchRate();
        }
    }, [fromAccountId, isInternational, fromAccount?.secondary_currency, profile?.currency]);

    const handleSubmit = async (formData: FormData) => {
        setIsSaving(true);
        try {
            // Adjust amounts if it's an international wallet and NOT a transfer
            if (isInternational && type !== 'transfer') {
                const secondaryAmount = parseFloat(formData.get("amount") as string);
                const rate = parseFloat(formData.get("exchange_rate") as string || exchangeRate.toString());
                const primaryAmount = secondaryAmount * rate;
                
                formData.set("secondary_amount", secondaryAmount.toString());
                formData.set("amount", primaryAmount.toString());
            }

            await addTransaction(formData);
            await refreshTransactions();
            if (onTransactionAddedAction) onTransactionAddedAction();
            const form = document.getElementById('add-transaction-form') as HTMLFormElement;
            form?.reset();
            setType("expense");
            setNotes("");
            setCategoryId("");
            setFromAccountId("");
            setToAccountId("");
        } finally {
            setIsSaving(false);
        }
    };

    const showSecondaryAmountField = type === 'transfer' && toAccount?.type === 'International Stock Wallet';

    return (
        <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm h-full">
            <h3 className="text-xl font-black text-foreground mb-6 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                    <ArrowsRightLeftIcon className="w-5 h-5 text-primary" />
                </div>
                Add Transaction
            </h3>
            <form id="add-transaction-form" action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                        {isInternational && type !== 'transfer' ? `Amount (${fromAccount.secondary_currency})` : 'Amount'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="amount"
                        autoComplete="off"
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                        placeholder="0.00"
                        required
                    />
                </div>

                {isInternational && type !== 'transfer' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                            Exchange Rate (1 {fromAccount.secondary_currency} = ? {profile?.currency || 'INR'})
                            {isFetchingRate && <span className="ml-2 animate-pulse text-primary font-bold">Fetching Live Rate...</span>}
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            name="exchange_rate"
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                            required
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Type</label>
                    <select
                        name="type"
                        value={type}
                        onChange={handleTypeChange}
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="investment">Investment/Savings</option>
                        <option value="transfer">Self-Transfer</option>
                    </select>
                </div>

                {type === 'transfer' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">To Account (Destination)</label>
                        <select
                            name="to_account_id"
                            value={toAccountId}
                            onChange={(e) => setToAccountId(e.target.value)}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                            required
                        >
                            <option value="">Select destination</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {type !== 'transfer' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Category</label>
                        <select
                            name="category_id"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        >
                            <option value="">No category</option>
                            {categories
                                .filter((c) => c.type === type)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                        {type === 'transfer' ? 'From Account (Source)' : 'Account'}
                    </label>
                    <select
                        name="account_id"
                        value={fromAccountId}
                        onChange={(e) => setFromAccountId(e.target.value)}
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    >
                        <option value="">Select account</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                {showSecondaryAmountField && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Secondary Amount ({toAccount?.secondary_currency})</label>
                        <input
                            type="number"
                            step="0.01"
                            name="secondary_amount"
                            autoComplete="off"
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                            placeholder="0.00"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Time</label>
                    <input
                        type="time"
                        name="time"
                        defaultValue={new Date().toTimeString().slice(0, 5)}
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Notes</label>
                    <div className="relative group">
                        <input
                            type="text"
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            autoComplete="off"
                            className="w-full px-5 py-3 pr-12 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                            placeholder="Lunch, Salary, Rent..."
                        />
                        {type !== 'transfer' && (
                            <button
                                type="button"
                                onClick={handleSuggestCategory}
                                disabled={isSuggesting || notes.length < 2 || !isPremium}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                                    isSuggesting 
                                        ? 'bg-primary/10 text-primary animate-pulse' 
                                        : !isPremium
                                            ? 'bg-background text-text-muted/30 cursor-not-allowed'
                                            : 'bg-background hover:bg-primary/10 text-text-muted hover:text-primary disabled:opacity-0'
                                }`}
                                title={isPremium ? "AI Suggest Category" : "AI Auto-categorization (Premium Only)"}
                            >
                                <SparklesIcon className={`w-4 h-4 ${isSuggesting ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                <input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />

                <div className="md:col-span-2 lg:col-span-1 flex items-end">
                    <button
                        type="submit"
                        className="w-full py-4 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs shadow-lg shadow-primary/20"
                    >
                        Save Transaction
                    </button>
                </div>
            </form>
        </div>
    );
}

export function EditTransactionModal({
    transaction, onCloseAction, onTransactionUpdatedAction
}: {
    transaction: Transaction,
    onCloseAction: () => void,
    onTransactionUpdatedAction?: () => void
}) {
    const { categories, accounts, refreshTransactions, setIsSaving, profile } = useDashboard();
    const [type, setType] = useState<"income" | "expense" | "transfer" | "investment">(transaction.type);
    const [notes, setNotes] = useState(transaction.notes || "");
    const [categoryId, setCategoryId] = useState(transaction.category_id || "");
    const [fromAccountId, setFromAccountId] = useState(transaction.account_id || "");
    const [toAccountId, setToAccountId] = useState(transaction.to_account_id || "");
    const [isSuggesting, setIsSuggesting] = useState(false);

    const isPremium = profile?.subscription_tier === 'premium';

    const handleSuggestCategory = async () => {
        if (!notes || notes.length < 2 || type === 'transfer' || !isPremium) return;
        
        setIsSuggesting(true);
        try {
            const result = await suggestTransactionCategory(notes, type);
            if (result && typeof result === 'object' && 'error' in result) {
                alert(result.message);
                return;
            }
            if (typeof result === 'string') {
                setCategoryId(result);
            }
        } catch (error) {
            console.error("Suggestion failed:", error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const [isFetchingRate, setIsFetchingRate] = useState(false);

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);
    const isInternational = fromAccount?.type === 'International Stock Wallet';
    const [exchangeRate, setExchangeRate] = useState<number>(
        transaction.secondary_amount && transaction.amount 
        ? transaction.amount / transaction.secondary_amount 
        : 83.5
    );

    // Fetch exchange rate automatically when account changes (if it's a new selection)
    useEffect(() => {
        if (isInternational && fromAccount?.secondary_currency && fromAccountId !== transaction.account_id) {
            const fetchRate = async () => {
                setIsFetchingRate(true);
                const rate = await getExchangeRate(fromAccount.secondary_currency!, profile?.currency || 'INR');
                setExchangeRate(rate);
                setIsFetchingRate(false);
            };
            fetchRate();
        }
    }, [fromAccountId, isInternational, fromAccount?.secondary_currency, profile?.currency, transaction.account_id]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-2xl w-full">
                <h3 className="text-xl font-bold text-foreground mb-6">Edit Transaction</h3>
                <form action={async (formData) => {
                    setIsSaving(true);
                    try {
                        // Adjust amounts if it's an international wallet and NOT a transfer
                        if (isInternational && type !== 'transfer') {
                            const secondaryAmount = parseFloat(formData.get("amount") as string);
                            const rate = parseFloat(formData.get("exchange_rate") as string || exchangeRate.toString());
                            const primaryAmount = secondaryAmount * rate;
                            
                            formData.set("secondary_amount", secondaryAmount.toString());
                            formData.set("amount", primaryAmount.toString());
                        }

                        await updateTransaction(transaction.id, formData);
                        await refreshTransactions();
                        if (onTransactionUpdatedAction) {
                            onTransactionUpdatedAction();
                        } else {
                            onCloseAction();
                        }
                    } catch (e: unknown) {
                        alert(e instanceof Error ? e.message : "An unknown error occurred");
                    } finally {
                        setIsSaving(false);
                    }
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">
                            {isInternational && type !== 'transfer' ? `Amount (${fromAccount.secondary_currency})` : 'Amount'}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            autoComplete="off"
                            defaultValue={isInternational && type !== 'transfer' ? transaction.secondary_amount || transaction.amount : transaction.amount}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        />
                    </div>

                    {isInternational && type !== 'transfer' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">
                                Exchange Rate
                                {isFetchingRate && <span className="ml-2 animate-pulse text-primary font-bold text-xs">Fetching...</span>}
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                name="exchange_rate"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                                className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                required
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Type</label>
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value as "income" | "expense" | "transfer" | "investment");
                                setCategoryId("");
                            }}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="investment">Investment/Savings</option>
                            <option value="transfer">Self-Transfer</option>
                        </select>
                    </div>

                    {type === 'transfer' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">To Account</label>
                            <select
                                name="to_account_id"
                                value={toAccountId}
                                onChange={(e) => setToAccountId(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                required
                            >
                                <option value="">Select destination</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type !== 'transfer' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">Category</label>
                            <select
                                name="category_id"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                                <option value="">No category</option>
                                {categories
                                    .filter((c) => c.type === type)
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Account</label>
                        <select
                            name="account_id"
                            value={fromAccountId}
                            onChange={(e) => setFromAccountId(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                            <option value="">Select account</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {type === 'transfer' && toAccount?.type === 'International Stock Wallet' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">Secondary Amount ({toAccount.secondary_currency})</label>
                            <input
                                type="number"
                                step="0.01"
                                name="secondary_amount"
                                defaultValue={transaction.secondary_amount || 0}
                                autoComplete="off"
                                className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Date</label>
                        <input
                            type="date"
                            name="date"
                            defaultValue={transaction.date.split("T")[0]}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Time</label>
                        <input
                            type="time"
                            name="time"
                            defaultValue={new Date(transaction.date).toTimeString().slice(0, 5)}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Notes</label>
                        <div className="relative group">
                            <input
                                type="text"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                autoComplete="off"
                                className="w-full px-4 py-2 pr-10 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                placeholder="Lunch, Salary, Rent..."
                            />
                            {type !== 'transfer' && (
                                <button
                                    type="button"
                                    onClick={handleSuggestCategory}
                                    disabled={isSuggesting || notes.length < 2 || !isPremium}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                                        isSuggesting 
                                            ? 'bg-primary/10 text-primary animate-pulse' 
                                            : !isPremium
                                                ? 'bg-background text-text-muted/30 cursor-not-allowed'
                                                : 'bg-background hover:bg-primary/10 text-text-muted hover:text-primary disabled:opacity-0'
                                    }`}
                                    title={isPremium ? "AI Suggest Category" : "AI Auto-categorization (Premium Only)"}
                                >
                                    <SparklesIcon className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                        </div>
                    </div>

                    <input type="hidden" name="timezoneOffset" value={new Date().getTimezoneOffset()} />

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="px-6 py-2 bg-background text-foreground/80 font-semibold rounded-lg transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function BulkEditModal({
    selectedIds, onCloseAction, onCompleteAction
}: {
    selectedIds: string[],
    onCloseAction: () => void,
    onCompleteAction: () => void
}) {
    const { categories, accounts, refreshTransactions, setIsSaving, showConfirmationAction } = useDashboard();
    const [date, setDate] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");

    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId && !accountId && !date) {
            alert("Please select at least one field to update");
            return;
        }

        setIsSaving(true);
        try {
            const updates: { category_id?: string; account_id?: string; date?: string } = {};
            if (categoryId) updates.category_id = categoryId === "null" ? undefined : categoryId;
            if (accountId) updates.account_id = accountId;
            if (date) {
                // We'll just update the date part, keeping time as 12:00 PM for simplicity in bulk
                updates.date = new Date(`${date}T12:00:00Z`).toISOString();
            }

            const { bulkUpdateTransactions } = await import("@/actions/transactions");
            await bulkUpdateTransactions(selectedIds, updates);
            await refreshTransactions();
            onCompleteAction();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "An unknown error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkDelete = () => {
        showConfirmationAction({
            title: "Bulk Delete Transactions",
            message: `Are you sure you want to delete ${selectedIds.length} transactions? This action cannot be undone.`,
            confirmText: "Delete All",
            onConfirmAction: async () => {
                setIsSaving(true);
                try {
                    const { bulkDeleteTransactions } = await import("@/actions/transactions");
                    await bulkDeleteTransactions(selectedIds);
                    await refreshTransactions();
                    onCompleteAction();
                } catch (e: unknown) {
                    alert(e instanceof Error ? e.message : "An unknown error occurred");
                } finally {
                    setIsSaving(false);
                }
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground">Bulk Edit ({selectedIds.length} items)</h3>
                    <button 
                        onClick={handleBulkDelete}
                        className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Delete All
                    </button>
                </div>
                
                <p className="text-xs text-text-muted mb-6">Only fields you select below will be updated for all selected transactions.</p>
                
                <form onSubmit={handleBulkUpdate} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">New Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        >
                            <option value="">Don&apos;t change</option>
                            <option value="null">Remove Category</option>
                            {/* Grouping categories by type could be better, but let's show all for bulk edit */}
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    [{c.type.toUpperCase()}] {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">New Account</label>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        >
                            <option value="">Don&apos;t change</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">New Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="px-6 py-3 text-sm font-bold text-text-muted hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs shadow-lg shadow-primary/20"
                        >
                            Update All
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddCategoryForm({ onCategoryChangeAction }: { onCategoryChangeAction?: () => void }) {
    const { categories, refreshCategories, setIsSaving, showConfirmationAction } = useDashboard();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    if (!showForm) {
        return (
            <div className="flex flex-col mb-8">
                <button
                    onClick={() => setShowForm(true)}
                    className="text-sm text-primary hover:text-primary-hover font-medium self-start mb-4"
                >
                    + Manage Categories
                </button>
            </div>
        );
    }

    return (
        <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <ChartPieIcon className="w-5 h-5 text-primary" />
                    </div>
                    Manage Categories
                </h3>
                <button 
                    onClick={() => setShowForm(false)} 
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-red-500 bg-background/50 rounded-xl transition-all"
                >
                    Close
                </button>
            </div>

            <form action={async (formData) => {
                setIsSaving(true);
                try {
                    await addCategory(formData);
                    await refreshCategories();
                    if (onCategoryChangeAction) onCategoryChangeAction();
                    (document.getElementById('add-category-form') as HTMLFormElement)?.reset();
                } finally {
                    setIsSaving(false);
                }
            }} id="add-category-form" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-surface-border/30">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">New Name</label>
                    <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                        placeholder="Groceries..."
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Type</label>
                    <select
                        name="type"
                        className="px-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Color</label>
                    <input
                        type="color"
                        name="color"
                        defaultValue="#2563eb"
                        className="h-11 w-full rounded-2xl border border-surface-border/50 bg-background/50 outline-none p-1.5 cursor-pointer transition-transform active:scale-95"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full py-4 bg-primary hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs shadow-lg shadow-primary/20"
                    >
                        Add Category
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`flex flex-col items-center p-3 rounded-xl bg-surface border shadow-sm transition-all ${category.user_id ? 'border-primary/30 ring-1 ring-primary/10' : 'border-surface-border'}`}
                    >
                        <div
                            className="w-3 h-3 rounded-full mb-2"
                            style={{ backgroundColor: category.color || '#ccc' }}
                        />
                        <span className="text-xs font-bold text-foreground truncate w-full text-center">
                            {category.name}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase font-black tracking-tighter mt-0.5">
                            {category.user_id ? 'Personal' : 'Standard'} • {category.type}
                        </span>

                        {category.user_id && (
                            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-surface-border w-full">
                                <button
                                    onClick={() => setEditingCategory(category)}
                                    className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
                                    title="Edit Category"
                                >
                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        showConfirmationAction({
                                            title: "Delete Category",
                                            message: `Are you sure you want to delete the "${category.name}" category? This will affect existing transactions.`,
                                            confirmText: "Delete",
                                            onConfirmAction: async () => {
                                                setIsSaving(true);
                                                try {
                                                    await deleteCategory(category.id);
                                                    await refreshCategories();
                                                    if (onCategoryChangeAction) onCategoryChangeAction();
                                                } finally {
                                                    setIsSaving(false);
                                                }
                                            },
                                        });
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
                                    title="Delete Category"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {editingCategory && (
                <EditCategoryModal
                    category={editingCategory}
                    onCloseAction={() => {
                        setEditingCategory(null);
                        if (onCategoryChangeAction) onCategoryChangeAction();
                    }}
                />
            )}
        </div>
    );
}

export function EditCategoryModal({ category, onCloseAction, onCategoryUpdatedAction }: { category: Category, onCloseAction: () => void, onCategoryUpdatedAction?: () => void }) {
    const { refreshCategories, setIsSaving } = useDashboard();
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
                <h3 className="text-xl font-bold text-foreground mb-6">Edit Category</h3>
                <form action={async (formData) => {
                    setIsSaving(true);
                    try {
                        await updateCategory(category.id, formData);
                        await refreshCategories();
                        if (onCategoryUpdatedAction) {
                            onCategoryUpdatedAction();
                        } else {
                            onCloseAction();
                        }
                    } finally {
                        setIsSaving(false);
                    }
                }} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Name</label>
                        <input
                            type="text"
                            name="name"
                            autoComplete="off"
                            defaultValue={category.name}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Type</label>
                        <select
                            name="type"
                            defaultValue={category.type}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="investment">Investment</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Color</label>
                        <input
                            type="color"
                            name="color"
                            defaultValue={category.color || "#2563eb"}
                            className="h-10 w-full rounded-lg border border-input-border bg-input outline-none p-1"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="px-6 py-2 bg-background text-foreground/80 font-semibold rounded-lg transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
