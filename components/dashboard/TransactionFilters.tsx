"use client";

import { Account, Category } from "@/types/database";
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface TransactionFiltersProps {
  accounts: Account[];
  categories: Category[];
  search: string;
  onSearchChangeAction: (value: string) => void;
  selectedAccountId: string;
  onAccountChangeAction: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChangeAction: (value: string) => void;
  selectedType: string;
  onTypeChangeAction: (value: string) => void;
  startDate: string;
  onStartDateChangeAction: (value: string) => void;
  endDate: string;
  onEndDateChangeAction: (value: string) => void;
  onClearAction: () => void;
}

export function TransactionFilters({
  accounts,
  categories,
  search,
  onSearchChangeAction,
  selectedAccountId,
  onAccountChangeAction,
  selectedCategoryId,
  onCategoryChangeAction,
  selectedType,
  onTypeChangeAction,
  startDate,
  onStartDateChangeAction,
  endDate,
  onEndDateChangeAction,
  onClearAction,
}: TransactionFiltersProps) {
  const hasFilters = search || selectedAccountId || selectedCategoryId || selectedType || startDate || endDate;

  return (
    <div className="bg-surface rounded-3xl border border-surface-border p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <FunnelIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {hasFilters && (
          <button
            onClick={onClearAction}
            className="ml-auto text-xs font-medium text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            Search Notes
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChangeAction(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Account Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            Account
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => onAccountChangeAction(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChangeAction(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            Type
          </label>
          <div className="flex bg-background border border-surface-border rounded-xl p-1">
            {["all", "income", "expense", "transfer"].map((type) => (
              <button
                key={type}
                onClick={() => onTypeChangeAction(type === "all" ? "" : type)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  (selectedType === type || (type === "all" && !selectedType))
                    ? "bg-surface text-primary shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            From Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChangeAction(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">
            To Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChangeAction(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
}
