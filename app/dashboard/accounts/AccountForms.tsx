"use client";

import { addAccount, updateAccount } from "./actions";
import { useState } from "react";
import { Account } from "@/types/database";

export function AddAccountForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const result = await addAccount(formData);
      if (result.error) {
        alert(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">Add Bank Account</h3>
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Account Name</label>
          <input
            type="text"
            name="name"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Chase Checking, Savings..."
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Type</label>
          <select
            name="type"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            required
          >
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Initial Balance</label>
          <input
            type="number"
            step="0.01"
            name="balance"
            className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Account"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditAccountModal({ account, onCloseAction }: { account: Account, onCloseAction: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const result = await updateAccount(account.id, formData);
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
        <h3 className="text-xl font-bold text-foreground mb-6">Edit Account</h3>
        <form action={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Account Name</label>
            <input
              type="text"
              name="name"
              defaultValue={account.name}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Type</label>
            <select
              name="type"
              defaultValue={account.type}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Investment">Investment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Balance</label>
            <input
              type="number"
              step="0.01"
              name="balance"
              defaultValue={account.balance}
              className="px-4 py-2 rounded-lg border border-input-border bg-input text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
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
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
