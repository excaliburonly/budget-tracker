"use client";

import { createEmergencyFund, updateEmergencyFund } from "@/actions/emergency-funds";
import { useState } from "react";
import { EmergencyFund } from "@/types/database";

export function AddEmergencyFundForm({ onFundAdded }: { onFundAdded?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const result = await createEmergencyFund(formData);
      if (result.error) {
        alert(result.error);
      } else {
        const form = document.getElementById("add-fund-form") as HTMLFormElement;
        form?.reset();
        if (onFundAdded) onFundAdded();
      }
    } finally {
      setIsSubmitting(false);
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

        <div className="lg:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Fund Goal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditEmergencyFundModal({ fund, onCloseAction }: { fund: EmergencyFund, onCloseAction: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const result = await updateEmergencyFund(fund.id, formData);
      if (result.error) {
        alert(result.error);
      } else {
        onCloseAction();
      }
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
