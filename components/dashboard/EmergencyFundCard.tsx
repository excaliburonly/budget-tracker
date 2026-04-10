"use client";

import { EmergencyFund } from "@/types/database";
import { formatCurrency } from "@/utils/format";
import { PencilSquareIcon, TrashIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { deleteEmergencyFund } from "@/actions/emergency-funds";

interface EmergencyFundCardProps {
  fund: EmergencyFund;
  currency: string;
  onEdit: (fund: EmergencyFund) => void;
  onRefresh: () => void;
}

export function EmergencyFundCard({ fund, currency, onEdit, onRefresh }: EmergencyFundCardProps) {
  const percentage = Math.min((fund.current_amount / fund.target_amount) * 100, 100);
  const isCompleted = fund.current_amount >= fund.target_amount;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this fund?')) {
      await deleteEmergencyFund(fund.id);
      onRefresh();
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-surface-border shadow-sm transition-all hover:shadow-md relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            {fund.instrument_type}
          </span>
          <h4 className="text-xl font-bold text-foreground mt-1">{fund.name}</h4>
          {fund.institution_name && (
            <div className="flex items-center gap-1 text-text-muted text-xs mt-1">
              <BuildingLibraryIcon className="w-3 h-3" />
              {fund.institution_name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(fund)}
            className="p-1.5 text-primary hover:bg-link-hover-bg rounded-lg transition-colors"
            title="Edit Fund"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
            title="Delete Fund"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-extrabold text-foreground">
              {formatCurrency(fund.current_amount, currency)}
            </div>
            <p className="text-xs text-text-muted/60">Current Balance</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-text-muted">
              {formatCurrency(fund.target_amount, currency)}
            </div>
            <p className="text-[10px] text-text-muted/60 uppercase tracking-wider">Target</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className={isCompleted ? "text-emerald-600" : "text-text-muted"}>
              {isCompleted ? "Goal Reached!" : "Progress"}
            </span>
            <span className="text-foreground">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-600'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
