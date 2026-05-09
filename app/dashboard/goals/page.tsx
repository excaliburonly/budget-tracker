"use client";

import { useDashboard } from "@/providers/dashboard-provider";
import { formatCurrency } from "@/utils/format";
import { FlagIcon, PlusIcon, ChartBarIcon, BanknotesIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { AddGoalForm, EditGoalModal, ManageAllocationsModal } from "@/components/forms/GoalForms";
import { Goal, Account, Investment } from "@/types/database";

export default function GoalsPage() {
    const { 
        goals, 
        goalAllocations, 
        accounts, 
        investments, 
        currency, 
        loading,
        refreshGoals,
        refreshGoalAllocations,
    } = useDashboard();
    
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [allocatingGoal, setAllocatingGoal] = useState<Goal | null>(null);

    const goalsWithData = useMemo(() => {
        return goals.map(goal => {
            const allocations = goalAllocations.filter(a => a.goal_id === goal.id);
            const currentAmount = allocations.reduce((acc, alloc) => {
                let assetValue = 0;
                if (alloc.asset_type === 'account') {
                    const account = accounts.find(a => a.id === alloc.asset_id);
                    assetValue = account ? Number(account.balance) : 0;
                } else {
                    const investment = investments.find(i => i.id === alloc.asset_id);
                    assetValue = investment ? Number(investment.current_value) * Number(investment.quantity) : 0;
                }
                return acc + (assetValue * (Number(alloc.percentage) / 100));
            }, 0);

            return {
                ...goal,
                current_amount: currentAmount,
                percentage: goal.target_amount > 0 ? (currentAmount / goal.target_amount) * 100 : 0,
                allocations
            };
        });
    }, [goals, goalAllocations, accounts, investments]);

    if (loading) {
        return <div className="p-8 text-center text-text-muted font-bold animate-pulse">Loading your financial goals...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <FlagIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Savings Goals</h1>
                        <p className="text-text-muted font-medium">Track your progress by allocating percentages of your assets.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddingGoal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Goal
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {goalsWithData.map((goal) => (
                    <div key={goal.id} className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        {/* Progress Background */}
                        <div 
                            className="absolute inset-0 bg-primary/5 transition-all duration-1000 ease-out origin-left"
                            style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        />

                        <div className="relative space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-foreground tracking-tight">{goal.name}</h3>
                                    {goal.deadline && (
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">
                                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEditingGoal(goal)}
                                        className="p-2 text-text-muted/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current Progress</p>
                                        <p className="text-3xl font-black text-foreground tracking-tighter">
                                            {formatCurrency(goal.current_amount, currency)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Target</p>
                                        <p className="text-lg font-bold text-foreground/60">{formatCurrency(goal.target_amount, currency)}</p>
                                    </div>
                                </div>

                                <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden border border-surface-border/30">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                        style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    <span>{Math.round(goal.percentage)}% Reached</span>
                                    {goal.percentage >= 100 && <span>Goal Met! 🎉</span>}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-surface-border/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Linked Assets ({goal.allocations.length})</h4>
                                    <button 
                                        onClick={() => setAllocatingGoal(goal)}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                    >
                                        Manage Assets
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {goal.allocations.map(alloc => {
                                        const asset = (alloc.asset_type === 'account' 
                                            ? accounts.find(a => a.id === alloc.asset_id)
                                            : investments.find(i => i.id === alloc.asset_id)) as Account | Investment | undefined;
                                        
                                        const assetName = asset 
                                            ? ('name' in asset ? asset.name : asset.asset_name)
                                            : 'Unknown Asset';

                                        return (
                                            <div key={alloc.id} className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-surface-border/30">
                                                {alloc.asset_type === 'account' ? <BanknotesIcon className="w-3 h-3 text-emerald-500" /> : <ChartBarIcon className="w-3 h-3 text-blue-500" />}
                                                <span className="text-[10px] font-bold text-foreground truncate max-w-[80px]">{assetName}</span>
                                                <span className="text-[10px] font-black text-primary">{alloc.percentage}%</span>
                                            </div>
                                        );
                                    })}
                                    {goal.allocations.length === 0 && (
                                        <p className="text-[10px] text-text-muted font-medium italic">No assets linked to this goal yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {goals.length === 0 && (
                    <div className="col-span-full py-20 bg-surface/30 rounded-[3rem] border-2 border-dashed border-surface-border flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-background rounded-[2rem] flex items-center justify-center">
                            <FlagIcon className="w-10 h-10 text-text-muted/20" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-foreground">No Goals Defined</p>
                            <p className="text-sm text-text-muted max-w-xs mx-auto mt-2">Start tracking your big dreams by creating your first savings goal.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingGoal(true)}
                            className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            {isAddingGoal && (
                <AddGoalModal 
                    onCloseAction={() => setIsAddingGoal(false)} 
                    onGoalAddedAction={() => {
                        setIsAddingGoal(false);
                        refreshGoals();
                    }} 
                />
            )}

            {editingGoal && (
                <EditGoalModal
                    goal={editingGoal}
                    onCloseAction={() => setEditingGoal(null)}
                    onGoalUpdatedAction={() => {
                        setEditingGoal(null);
                        refreshGoals();
                    }}
                />
            )}

            {allocatingGoal && (
                <ManageAllocationsModal
                    goal={allocatingGoal}
                    onCloseAction={() => setAllocatingGoal(null)}
                    onAllocationsSavedAction={() => {
                        setAllocatingGoal(null);
                        refreshGoalAllocations();
                    }}
                />
            )}
        </div>
    );
}

function AddGoalModal({ onCloseAction, onGoalAddedAction }: { onCloseAction: () => void, onGoalAddedAction: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-lg rounded-[2.5rem] border border-surface-border p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Create Goal</h2>
                    <button onClick={onCloseAction} className="p-2 hover:bg-background rounded-xl transition-colors">
                        <PlusIcon className="w-6 h-6 rotate-45 text-text-muted" />
                    </button>
                </div>
                <AddGoalForm onGoalAddedAction={onGoalAddedAction} />
            </div>
        </div>
    );
}
