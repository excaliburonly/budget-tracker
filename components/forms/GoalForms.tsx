"use client";

import { createGoal, updateGoal, deleteGoal, saveAllocations } from "@/actions/goals";
import { Goal } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";
import { useState, useEffect } from "react";
import { TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function AddGoalForm({ onGoalAddedAction }: { onGoalAddedAction?: () => void }) {
  const { setIsSaving } = useDashboard();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setError(null);
    try {
      const result = await createGoal(formData);
      if (result.success) {
        onGoalAddedAction?.();
      } else {
        setError(result.error || "Failed to add goal");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Goal Name</label>
        <input
          type="text"
          name="name"
          placeholder="e.g., New Car, Emergency Fund, Bali Trip"
          required
          className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Target Amount</label>
        <input
          type="number"
          name="target_amount"
          step="0.01"
          placeholder="0.00"
          required
          className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Deadline (Optional)</label>
        <input
          type="date"
          name="deadline"
          className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
        />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
      >
        Create Goal
      </button>
    </form>
  );
}

export function EditGoalModal({ goal, onCloseAction, onGoalUpdatedAction }: { goal: Goal, onCloseAction: () => void, onGoalUpdatedAction: () => void }) {
  const { setIsSaving, showConfirmationAction } = useDashboard();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const result = await updateGoal(goal.id, formData);
      if (result.success) {
        onGoalUpdatedAction();
      } else {
        setError(result.error || "Failed to update goal");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = () => {
    showConfirmationAction({
      title: "Delete Goal",
      message: `Are you sure you want to delete "${goal.name}"? This will not delete your accounts or investments, only the goal tracking.`,
      isDanger: true,
      onConfirmAction: async () => {
        setIsSaving(true);
        try {
          await deleteGoal(goal.id);
          onGoalUpdatedAction();
        } catch (err: unknown) {
          alert(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-lg rounded-[2.5rem] border border-surface-border p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Edit Goal</h2>
          <button onClick={onCloseAction} className="p-2 hover:bg-background rounded-xl transition-colors">
            <XMarkIcon className="w-6 h-6 text-text-muted" />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Goal Name</label>
            <input
              type="text"
              name="name"
              defaultValue={goal.name}
              required
              className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Target Amount</label>
            <input
              type="number"
              name="target_amount"
              step="0.01"
              defaultValue={goal.target_amount}
              required
              className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              defaultValue={goal.deadline || ""}
              className="w-full px-5 py-3 rounded-2xl border border-surface-border bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs"
            >
              Delete
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ManageAllocationsModal({ goal, onCloseAction, onAllocationsSavedAction }: { goal: Goal, onCloseAction: () => void, onAllocationsSavedAction: () => void }) {
    const { accounts, investments, goalAllocations, setIsSaving } = useDashboard();
    const [localAllocations, setLocalAllocations] = useState<{ asset_type: 'account' | 'investment', asset_id: string, percentage: number }[]>([]);
    
    useEffect(() => {
        const existing = goalAllocations.filter(a => a.goal_id === goal.id).map(a => ({
            asset_type: a.asset_type,
            asset_id: a.asset_id,
            percentage: Number(a.percentage)
        }));
        setLocalAllocations(existing);
    }, [goal.id, goalAllocations]);

    const handleAddAllocation = () => {
        setLocalAllocations([...localAllocations, { asset_type: 'account', asset_id: '', percentage: 10 }]);
    };

    const handleRemoveAllocation = (index: number) => {
        setLocalAllocations(localAllocations.filter((_, i) => i !== index));
    };

    const updateAllocation = (index: number, field: string, value: string | number) => {
        const updated = [...localAllocations];
        const item = updated[index];
        if (field === 'asset_type') {
            updated[index] = { ...item, asset_type: value as 'account' | 'investment', asset_id: '' };
        } else if (field === 'asset_id') {
            updated[index] = { ...item, asset_id: value as string };
        } else if (field === 'percentage') {
            updated[index] = { ...item, percentage: value as number };
        }
        setLocalAllocations(updated);
    };

    const handleSave = async () => {
        // Validate
        if (localAllocations.some(a => !a.asset_id)) {
            alert("Please select an asset for all allocations.");
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveAllocations(goal.id, localAllocations);
            if (result.success) {
                onAllocationsSavedAction();
            } else {
                alert(result.error);
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to save allocations");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] border border-surface-border p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Manage Assets</h2>
                        <p className="text-text-muted text-xs font-medium mt-1">Assign percentages of your assets to &quot;{goal.name}&quot;</p>
                    </div>
                    <button onClick={onCloseAction} className="p-2 hover:bg-background rounded-xl transition-colors">
                        <XMarkIcon className="w-6 h-6 text-text-muted" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {localAllocations.map((alloc, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-background/50 rounded-2xl border border-surface-border/50 group">
                            <div className="w-full sm:w-32 shrink-0">
                                <select 
                                    value={alloc.asset_type}
                                    onChange={(e) => updateAllocation(index, 'asset_type', e.target.value)}
                                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="account">Bank Account</option>
                                    <option value="investment">Investment</option>
                                </select>
                            </div>
                            
                            <div className="w-full flex-1">
                                <select
                                    value={alloc.asset_id}
                                    onChange={(e) => updateAllocation(index, 'asset_id', e.target.value)}
                                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="">Select Asset...</option>
                                    {alloc.asset_type === 'account' ? (
                                        accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)
                                    ) : (
                                        investments.map(i => <option key={i.id} value={i.id}>{i.asset_name} ({i.investment_type})</option>)
                                    )}
                                </select>
                            </div>

                            <div className="w-full sm:w-24 shrink-0 flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={alloc.percentage}
                                    onChange={(e) => updateAllocation(index, 'percentage', parseFloat(e.target.value))}
                                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-right"
                                />
                                <span className="text-xs font-black text-text-muted">%</span>
                            </div>

                            <button 
                                onClick={() => handleRemoveAllocation(index)}
                                className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {localAllocations.length === 0 && (
                        <div className="py-10 text-center border-2 border-dashed border-surface-border/50 rounded-2xl">
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">No assets linked yet</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-surface-border/30 flex flex-col sm:flex-row gap-4 shrink-0">
                    <button
                        onClick={handleAddAllocation}
                        className="flex-1 py-4 border-2 border-dashed border-primary/30 text-primary font-black uppercase tracking-widest rounded-2xl hover:bg-primary/5 transition-all text-[10px] flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Asset
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px]"
                    >
                        Save Allocations
                    </button>
                </div>
            </div>
        </div>
    );
}
