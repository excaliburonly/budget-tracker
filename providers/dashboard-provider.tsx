"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  getTransactions, 
  getCategories 
} from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import { getEmergencyFunds } from "@/actions/emergency-funds";
import { getInvestments } from "@/actions/investments";
import { getBudgets } from "@/actions/budgets";
import { Account, Category, EmergencyFund, Investment, Transaction, Budget } from "@/types/database";
import { createClient } from "@/utils/supabase/client";

interface DashboardContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  emergencyFunds: EmergencyFund[];
  investments: Investment[];
  budgets: Budget[];
  currency: string;
  loading: boolean;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  refreshAll: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshEmergencyFunds: () => Promise<void>;
  refreshInvestments: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshCurrency: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [emergencyFunds, setEmergencyFunds] = useState<EmergencyFund[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const refreshCurrency = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();
      setCurrency(profile?.currency || "INR");
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

  const refreshEmergencyFunds = useCallback(async () => {
    const data = await getEmergencyFunds();
    setEmergencyFunds(data);
  }, []);

  const refreshInvestments = useCallback(async () => {
    const data = await getInvestments();
    setInvestments(data);
  }, []);

  const refreshBudgets = useCallback(async () => {
    const data = await getBudgets(currentMonth);
    setBudgets(data);
  }, [currentMonth]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshCurrency(),
        refreshTransactions(),
        refreshCategories(),
        refreshAccounts(),
        refreshEmergencyFunds(),
        refreshInvestments(),
        refreshBudgets(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    refreshCurrency,
    refreshTransactions,
    refreshCategories,
    refreshAccounts,
    refreshEmergencyFunds,
    refreshInvestments,
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
        emergencyFunds,
        investments,
        budgets,
        currency,
        loading,
        isSaving,
        setIsSaving,
        refreshAll,
        refreshTransactions,
        refreshCategories,
        refreshAccounts,
        refreshEmergencyFunds,
        refreshInvestments,
        refreshBudgets,
        refreshCurrency,
      }}
    >
      {children}
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
