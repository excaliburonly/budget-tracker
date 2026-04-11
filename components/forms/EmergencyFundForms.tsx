"use client";

import { createEmergencyFund, updateEmergencyFund } from "@/actions/emergency-funds";
import { EmergencyFund } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";

export function AddEmergencyFundForm({ onFundAddedAction }: { onFundAddedAction?: () => void }) {
  const { refreshEmergencyFunds, setIsSaving, accounts } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const result = await createEmergencyFund(formData);
      if (result.error) {
        alert(result.error);
      } else {
        await refreshEmergencyFunds();
        const form = document.getElementById("add-fund-form") as HTMLFormElement;
        form?.reset();
        if (onFundAddedAction) onFundAddedAction();
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">New Emergency Fund / Goal</h3>
      <form id="add-fund-form" action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Goal Name</label>
          <input
            type="text"
            name="name"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="Main Emergency Fund..."
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Instrument Type</label>
          <select
            name="instrument_type"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            required
          >
            <option value="Savings Account">Savings Account</option>
            <option value="Fixed Deposit">Fixed Deposit</option>
            <option value="Liquid Fund">Liquid Fund</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Institution (Optional)</label>
          <input
            type="text"
            name="institution_name"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="HDFC, Chase, etc."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Target Amount</label>
          <input
            type="number"
            step="0.01"
            name="target_amount"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Initial Contribution</label>
          <input
            type="number"
            step="0.01"
            name="initial_amount"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Funding Account</label>
          <select
            name="account_id"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
          >
            <option value="">No account (manual balance)</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>{account.name} (₹{account.balance.toLocaleString()})</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Create Fund Goal
          </button>
        </div>
      </form>
    </div>
  );
}

// ... (EditEmergencyFundModal remains largely same)

import { addEmergencyFundTransaction } from "@/actions/emergency-funds";

export function AddEmergencyFundTransactionModal({ 
  fund, 
  onCloseAction, 
  onTransactionAddedAction 
}: { 
  fund: EmergencyFund, 
  onCloseAction: () => void, 
  onTransactionAddedAction?: () => void 
}) {
  const { refreshAll, setIsSaving, accounts } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const result = await addEmergencyFundTransaction(fund.id, formData);
      if (result.error) {
        alert(result.error);
      } else {
        await refreshAll();
        if (onTransactionAddedAction) {
          onTransactionAddedAction();
        } else {
          onCloseAction();
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">Add Transaction: {fund.name}</h3>
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
                <option value="contribution">Contribution</option>
                <option value="withdrawal">Withdrawal</option>
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
              <label className="block text-sm font-medium text-foreground/80 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
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
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditEmergencyFundModal({ fund, onCloseAction, onFundUpdatedAction }: { fund: EmergencyFund, onCloseAction: () => void, onFundUpdatedAction?: () => void }) {
  const { refreshEmergencyFunds, setIsSaving } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const result = await updateEmergencyFund(fund.id, formData);
      if (result.error) {
        alert(result.error);
      } else {
        await refreshEmergencyFunds();
        if (onFundUpdatedAction) {
          onFundUpdatedAction();
        } else {
          onCloseAction();
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-8 rounded-3xl border border-surface-border shadow-2xl max-w-lg w-full">
        <h3 className="text-xl font-bold text-foreground mb-6">Edit Fund Goal</h3>
        <form action={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Goal Name</label>
            <input
              type="text"
              name="name"
              defaultValue={fund.name}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Instrument Type</label>
            <select
              name="instrument_type"
              defaultValue={fund.instrument_type}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              required
            >
              <option value="Savings Account">Savings Account</option>
              <option value="Fixed Deposit">Fixed Deposit</option>
              <option value="Liquid Fund">Liquid Fund</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Institution</label>
            <input
              type="text"
              name="institution_name"
              defaultValue={fund.institution_name || ""}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Target Amount</label>
            <input
              type="number"
              step="0.01"
              name="target_amount"
              defaultValue={fund.target_amount}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              required
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
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
