"use client";

import { addInvestment, updateInvestment } from "@/actions/investments";
import { Investment } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";
import { useState, useEffect, useRef } from "react";
import { searchMutualFunds, MFSearchResponse } from "@/utils/nav-api";

function MutualFundSearchInput({ 
  onSelectAction, 
  initialValue = "" 
}: { 
  onSelectAction: (schemeName: string, schemeCode: number) => void,
  initialValue?: string
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<MFSearchResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length >= 3) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        const res = await searchMutualFunds(query);
        setResults(res);
        setShowResults(true);
        setIsSearching(false);
      }, 500);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        name="asset_name"
        required
        value={query}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (val.length >= 3) {
            setIsSearching(true);
          } else {
            setResults([]);
            setShowResults(false);
            setIsSearching(false);
          }
        }}
        onFocus={() => query.length >= 3 && setShowResults(true)}
        placeholder="Search Mutual Fund..."
        className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
      />
      {isSearching && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      {showResults && results.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-surface border border-surface-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.schemeCode}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-background/50 text-sm transition-colors border-b border-surface-border last:border-0"
              onClick={() => {
                setQuery(result.schemeName);
                onSelectAction(result.schemeName, result.schemeCode);
                setShowResults(false);
              }}
            >
              <div className="font-medium">{result.schemeName}</div>
              <div className="text-[10px] text-text-muted">Code: {result.schemeCode}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const INVESTMENT_TYPES = [
  "Mutual Fund",
  "Stock",
  "Gold",
  "Silver",
  "Real Estate",
  "Crypto",
  "Other"
];

export function AddInvestmentForm({ 
  onInvestmentAddedAction,
  initialType 
}: { 
  onInvestmentAddedAction?: () => void,
  initialType?: string
}) {
  const { refreshInvestments, setIsSaving, accounts } = useDashboard();
  const [investmentType, setInvestmentType] = useState(initialType || "");
  const [schemeCode, setSchemeCode] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await addInvestment(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        await refreshInvestments();
        const form = document.getElementById("investment-form") as HTMLFormElement;
        form?.reset();
        setInvestmentType("");
        setSchemeCode("");
        if (onInvestmentAddedAction) onInvestmentAddedAction();
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Add New Investment</h3>
      <form id="investment-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="asset_name" className="block text-sm font-medium text-foreground/80 mb-1">
              Asset Name
            </label>
            {investmentType === "Mutual Fund" ? (
              <MutualFundSearchInput 
                onSelectAction={(name, code) => {
                  setSchemeCode(code.toString());
                }}
              />
            ) : (
              <input
                type="text"
                name="asset_name"
                id="asset_name"
                required
                placeholder="e.g. Nifty 50 Index Fund"
                className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <div>
            <label htmlFor="investment_type" className="block text-sm font-medium text-foreground/80 mb-1">
              Investment Type
            </label>
            <select
              name="investment_type"
              id="investment_type"
              required
              value={investmentType}
              onChange={(e) => setInvestmentType(e.target.value)}
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              {INVESTMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-foreground/80 mb-1">
              Symbol / Scheme Code
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value)}
              placeholder="e.g. 120503"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
            <p className="text-[10px] text-text-muted mt-1 leading-tight">Use MFAPI.in Scheme Code for Mutual Funds</p>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-foreground/80 mb-1">
              Initial Quantity
            </label>
            <input
              type="number"
              step="0.0001"
              name="quantity"
              id="quantity"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="average_buy_price" className="block text-sm font-medium text-foreground/80 mb-1">
              Initial Buy Price
            </label>
            <input
              type="number"
              step="0.01"
              name="average_buy_price"
              id="average_buy_price"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="current_value" className="block text-sm font-medium text-foreground/80 mb-1">
              Current Market Value
            </label>
            <input
              type="number"
              step="0.01"
              name="current_value"
              id="current_value"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="account_id" className="block text-sm font-medium text-foreground/80 mb-1">
              Funding Account
            </label>
            <select
              name="account_id"
              id="account_id"
              required
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name} (₹{account.balance.toLocaleString()})</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          Add Investment
        </button>
      </form>
    </div>
  );
}

export function EditInvestmentModal({ investment, onCloseAction, onInvestmentUpdatedAction }: { investment: Investment, onCloseAction: () => void, onInvestmentUpdatedAction?: () => void }) {
  const { refreshInvestments, setIsSaving } = useDashboard();
  const [investmentType, setInvestmentType] = useState(investment.investment_type);
  const [schemeCode, setSchemeCode] = useState(investment.symbol || "");

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await updateInvestment(investment.id, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        await refreshInvestments();
        if (onInvestmentUpdatedAction) {
          onInvestmentUpdatedAction();
        } else {
          onCloseAction();
        }
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">Edit Investment</h3>
          <button onClick={onCloseAction} className="text-foreground/50 hover:text-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Asset Name</label>
              {investmentType === "Mutual Fund" ? (
                <MutualFundSearchInput 
                  initialValue={investment.asset_name}
                  onSelectAction={(name, code) => {
                    setSchemeCode(code.toString());
                  }}
                />
              ) : (
                <input
                  type="text"
                  name="asset_name"
                  defaultValue={investment.asset_name}
                  required
                  className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Investment Type</label>
              <select
                name="investment_type"
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              >
                {INVESTMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Symbol / Scheme Code</label>
              <input
                type="text"
                name="symbol"
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value)}
                placeholder="e.g. 120503"
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
              <p className="text-[10px] text-text-muted mt-1 leading-tight">Use MFAPI.in Scheme Code for Mutual Funds</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Quantity</label>
              <input
                type="number"
                step="0.0001"
                name="quantity"
                defaultValue={investment.quantity}
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Avg. Buy Price</label>
              <input
                type="number"
                step="0.01"
                name="average_buy_price"
                defaultValue={investment.average_buy_price}
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Current Market Value</label>
              <input
                type="number"
                step="0.01"
                name="current_value"
                defaultValue={investment.current_value}
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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

import { addInvestmentTransaction } from "@/actions/investments";

export function AddInvestmentTransactionModal({ 
  investment, 
  onCloseAction, 
  onTransactionAddedAction 
}: { 
  investment: Investment, 
  onCloseAction: () => void, 
  onTransactionAddedAction?: () => void 
}) {
  const { refreshAll, setIsSaving, accounts } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await addInvestmentTransaction(investment.id, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        await refreshAll();
        if (onTransactionAddedAction) {
          onTransactionAddedAction();
        } else {
          onCloseAction();
        }
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">Add Transaction: {investment.asset_name}</h3>
          <button onClick={onCloseAction} className="text-foreground/50 hover:text-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Type</label>
              <select
                name="type"
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="buy">Buy (SIP / Installment)</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Quantity</label>
              <input
                type="number"
                step="0.0001"
                name="quantity"
                required
                placeholder="0.00"
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Price per unit</label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                placeholder="0.00"
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Account</label>
              <select
                name="account_id"
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name} (₹{account.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>
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
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
