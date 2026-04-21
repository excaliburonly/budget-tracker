"use client";

import { ChangeEvent, useState } from "react";
import { addCategory, addTransaction, deleteCategory, updateCategory, updateTransaction } from "@/actions/transactions";
import { Category, Transaction } from "@/types/database";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

export function AddTransactionForm({ onTransactionAddedAction }: { onTransactionAddedAction?: () => void }) {
    const { categories, accounts, refreshTransactions, setIsSaving } = useDashboard();
    const [type, setType] = useState<"income" | "expense" | "transfer">("expense");

    const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value as "income" | "expense" | "transfer");
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSaving(true);
        try {
            await addTransaction(formData);
            await refreshTransactions();
            if (onTransactionAddedAction) onTransactionAddedAction();
            const form = document.getElementById('add-transaction-form') as HTMLFormElement;
            form?.reset();
            setType("expense");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add Transaction</h3>
            <form id="add-transaction-form" action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        name="amount"
                        autoComplete="off"
                        className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80">Type</label>
                    <select
                        name="type"
                        value={type}
                        onChange={handleTypeChange}
                        className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="transfer">Self-Transfer</option>
                    </select>
                </div>

                {type !== 'transfer' ? (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Category</label>
                        <select
                            name="category_id"
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
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">To Account (Destination)</label>
                        <select
                            name="to_account_id"
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

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80">
                        {type === 'transfer' ? 'From Account (Source)' : 'Account'}
                    </label>
                    <select
                        name="account_id"
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

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80">Date</label>
                    <input
                        type="date"
                        name="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground/80">Time</label>
                    <input
                        type="time"
                        name="time"
                        defaultValue={new Date().toTimeString().slice(0, 5)}
                        className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                    />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                    <label className="text-sm font-medium text-foreground/80">Notes</label>
                    <input
                        type="text"
                        name="notes"
                        autoComplete="off"
                        className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="Lunch, Salary, Rent..."
                    />
                </div>

                <div className="lg:col-span-3 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        Add Transaction
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
    const { categories, accounts, refreshTransactions, setIsSaving } = useDashboard();
    const [type, setType] = useState<"income" | "expense" | "transfer">(transaction.type);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-2xl w-full">
                <h3 className="text-xl font-bold text-foreground mb-6">Edit Transaction</h3>
                <form action={async (formData) => {
                    setIsSaving(true);
                    try {
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
                        <label className="text-sm font-medium text-foreground/80">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            autoComplete="off"
                            defaultValue={transaction.amount}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Type</label>
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as "income" | "expense" | "transfer")}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="transfer">Self-Transfer</option>
                        </select>
                    </div>

                    {type !== 'transfer' ? (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">Category</label>
                            <select
                                name="category_id"
                                defaultValue={transaction.category_id || ""}
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
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground/80">To Account</label>
                            <select
                                name="to_account_id"
                                defaultValue={transaction.to_account_id || ""}
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

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground/80">Account</label>
                        <select
                            name="account_id"
                            defaultValue={transaction.account_id || ""}
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
                        <input
                            type="text"
                            name="notes"
                            autoComplete="off"
                            defaultValue={transaction.notes || ""}
                            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                    </div>

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
        <div className="bg-background/50 p-6 rounded-2xl border border-dashed border-input-border mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-md font-semibold text-foreground">Categories</h3>
                <button onClick={() => setShowForm(false)} className="text-xs text-text-muted hover:text-gray-700 font-medium">Close</button>
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
            }} id="add-category-form" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-surface-border">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">New Name</label>
                    <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        className="px-3 py-1.5 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="Groceries..."
                        required
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Type</label>
                    <select
                        name="type"
                        className="px-3 py-1.5 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Color</label>
                    <input
                        type="color"
                        name="color"
                        defaultValue="#2563eb"
                        className="h-9 w-full rounded-lg border border-input-border bg-input outline-none p-1"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        Add
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="flex flex-col items-center p-3 rounded-xl bg-surface border border-surface-border shadow-sm"
                    >
                        <div
                            className="w-3 h-3 rounded-full mb-2"
                            style={{ backgroundColor: category.color || '#ccc' }}
                        />
                        <span className="text-xs font-bold text-foreground truncate w-full text-center">
                            {category.name}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase font-medium mt-0.5">
                            {category.type}
                        </span>

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
