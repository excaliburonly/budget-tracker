"use client";

import { updateProfile } from "@/actions/profiles";
import { Profile } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";
import { UserCircleIcon, BanknotesIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function ProfileForm({ profile }: { profile: Profile }) {
  const { setIsSaving, refreshCurrency } = useDashboard();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(formData);
      await refreshCurrency();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-surface-border/50 shadow-sm max-w-2xl mx-auto">
      <h3 className="text-xl font-black text-foreground mb-6 tracking-tight flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <UserCircleIcon className="w-5 h-5 text-primary" />
        </div>
        Your Profile
      </h3>
      
      <form action={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
          <div className="relative">
            <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
            <input
              type="text"
              name="fullName"
              defaultValue={profile.full_name || ""}
              autoComplete="off"
              className="w-full pl-12 pr-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
              placeholder="Your full name..."
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Currency</label>
          <div className="relative">
            <BanknotesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
            <select
              name="currency"
              defaultValue={profile.currency || "INR"}
              className="w-full pl-12 pr-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold appearance-none"
              required
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Avatar URL</label>
          <div className="relative">
            <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/50" />
            <input
              type="url"
              name="avatarUrl"
              defaultValue={profile.avatar_url || ""}
              autoComplete="off"
              className="w-full pl-12 pr-5 py-3 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted/40 font-bold"
              placeholder="https://example.com/avatar.png"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-top-1">
            Profile updated successfully!
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-primary hover:scale-105 active:scale-95 text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs shadow-lg shadow-primary/20"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
