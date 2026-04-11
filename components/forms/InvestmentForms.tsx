"use client";

import { addInvestment, updateInvestment } from "@/actions/investments";
import { Investment } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";

export function AddInvestmentForm({ onInvestmentAdded }: { onInvestmentAdded?: () => void }) {
  const { refreshInvestments, setIsSaving } = useDashboard();

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
        if (onInvestmentAdded) onInvestmentAdded();
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
            <input
              type="text"
              name="asset_name"
              id="asset_name"
              required
              placeholder="e.g. Nifty 50 Index Fund"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-foreground/80 mb-1">
              Symbol / Ticker
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              placeholder="e.g. NIFTYBEES"
              className="w-full rounded-lg border border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-foreground/80 mb-1">
              Quantity
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
              Avg. Buy Price
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

export function EditInvestmentModal({ investment, onClose }: { investment: Investment, onClose: () => void }) {
  const { refreshInvestments, setIsSaving } = useDashboard();

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      const res = await updateInvestment(investment.id, formData);
      if (res?.error) {
        alert(res.error);
      } else {
        await refreshInvestments();
        onClose();
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
        <h3 className="text-xl font-bold text-foreground mb-6">Edit Investment</h3>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Asset Name</label>
              <input
                type="text"
                name="asset_name"
                defaultValue={investment.asset_name}
                required
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Symbol</label>
              <input
                type="text"
                name="symbol"
                defaultValue={investment.symbol || ""}
                className="w-full rounded-lg border-input-border bg-input text-foreground focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
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
              onClick={onClose}
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
