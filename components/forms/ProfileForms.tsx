"use client";

import { updateProfile } from "@/actions/profiles";
import { Profile } from "@/types/database";
import { useDashboard } from "@/providers/dashboard-provider";
import { UserCircleIcon, BanknotesIcon, CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getInitials } from "@/utils/format";
import { useState, useRef } from "react";
import Image from "next/image";

export function ProfileForm({ profile }: { profile: Profile }) {
  const { setIsSaving, refreshProfile } = useDashboard();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size must be less than 2MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const removeAvatar = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    // If previewUrl is null, it means user removed the avatar
    if (!previewUrl) {
      formData.set("avatarUrl", "");
    } else {
      formData.set("avatarUrl", profile.avatar_url || "");
    }

    try {
      await updateProfile(formData);
      await refreshProfile();
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
      <h3 className="text-xl font-black text-foreground mb-8 tracking-tight flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <UserCircleIcon className="w-5 h-5 text-primary" />
        </div>
        Your Profile
      </h3>
      
      <form action={handleSubmit} className="space-y-8">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 bg-background flex items-center justify-center relative transition-all group-hover:border-primary/40">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized={previewUrl.startsWith('blob:')}
                />
              ) : (
                <span className="text-3xl font-black text-primary/40">
                  {getInitials(profile.full_name)}
                </span>
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <CameraIcon className="w-8 h-8 text-white" />
              </button>
            </div>
            
            {previewUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-95"
                title="Remove photo"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Profile Photo</p>
            <p className="text-[10px] text-text-muted/60 mt-1">PNG, JPG up to 2MB</p>
          </div>
          
          <input
            type="file"
            name="avatarFile"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="space-y-6">
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
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in fade-in slide-in-from-top-1 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-top-1 text-center">
            Profile updated successfully!
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="px-12 py-4 bg-primary hover:scale-105 active:scale-95 text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs shadow-xl shadow-primary/20 flex items-center gap-3"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
