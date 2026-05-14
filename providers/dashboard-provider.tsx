"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getTransactions, 
  getCategories 
} from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import { 
  getGoals, 
  getGoalAllocations 
} from "@/actions/goals";
import { 
  getInvestments, 
  getInvestmentTransactions 
} from "@/actions/investments";
import { getBudgets } from "@/actions/budgets";
import { 
  Account, 
  Category, 
  Goal,
  GoalAllocation,
  Investment, 
  Transaction, 
  Budget,
  Profile,
  InvestmentTransaction,
} from "@/types/database";
import { createClient } from "@/utils/supabase/client";
import { ConfirmationModal } from "@/components/theme/ConfirmationModal";

interface ConfirmationConfig {
  title: string;
  message: string;
  onConfirmAction: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface DashboardContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  goalAllocations: GoalAllocation[];
  investments: Investment[];
  investmentTransactions: InvestmentTransaction[];
  budgets: Budget[];
  profile: Profile | null;
  currency: string;
  currentMonth: string;
  loading: boolean;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  refreshAll: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshGoals: () => Promise<void>;
  refreshGoalAllocations: () => Promise<void>;
  refreshInvestments: () => Promise<void>;
  refreshInvestmentTransactions: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  showConfirmationAction: (config: ConfirmationConfig) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalAllocations, setGoalAllocations] = useState<GoalAllocation[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig | null>(null);

  const showConfirmationAction = useCallback((config: ConfirmationConfig) => {
    setConfirmation(config);
  }, []);

  const closeConfirmationAction = useCallback(() => {
    setConfirmation(null);
  }, []);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) {
        setProfile(profileData);
        setCurrency(profileData.currency || "INR");
      }
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);
  }, []);

  const refreshCategories = useCallback(async () => {
    const data = await getCategories();
    setCategories(data);
  }, []);

  const refreshAccounts = useCallback(async () => {
    const data = await getAccounts();
    setAccounts(data);
  }, []);

  const refreshGoals = useCallback(async () => {
    const data = await getGoals();
    setGoals(data);
  }, []);

  const refreshGoalAllocations = useCallback(async () => {
    const data = await getGoalAllocations();
    setGoalAllocations(data);
  }, []);

  const refreshInvestments = useCallback(async () => {
    const data = await getInvestments();
    setInvestments(data);
  }, []);

  const refreshInvestmentTransactions = useCallback(async () => {
    const data = await getInvestmentTransactions();
    setInvestmentTransactions(data);
  }, []);

  const refreshBudgets = useCallback(async () => {
    const data = await getBudgets(currentMonth);
    setBudgets(data);
  }, [currentMonth]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshProfile(),
        refreshTransactions(),
        refreshCategories(),
        refreshAccounts(),
        refreshGoals(),
        refreshGoalAllocations(),
        refreshInvestments(),
        refreshInvestmentTransactions(),
        refreshBudgets(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    refreshProfile,
    refreshTransactions,
    refreshCategories,
    refreshAccounts,
    refreshGoals,
    refreshGoalAllocations,
    refreshInvestments,
    refreshInvestmentTransactions,
    refreshBudgets,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <DashboardContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        goals,
        goalAllocations,
        investments,
        investmentTransactions,
        budgets,
        profile,
        currency,
        currentMonth,
        loading,
        isSaving,
        setIsSaving,
        refreshAll,
        refreshTransactions,
        refreshCategories,
        refreshAccounts,
        refreshGoals,
        refreshGoalAllocations,
        refreshInvestments,
        refreshInvestmentTransactions,
        refreshBudgets,
        refreshProfile,
        showConfirmationAction,
      }}
    >
      {children}
      <ConfirmationModal
        isOpen={!!confirmation}
        title={confirmation?.title || ""}
        message={confirmation?.message || ""}
        onConfirmAction={confirmation?.onConfirmAction || (() => {})}
        onCloseAction={closeConfirmationAction}
        confirmText={confirmation?.confirmText}
        cancelText={confirmation?.cancelText}
        isDanger={confirmation?.isDanger}
      />
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
