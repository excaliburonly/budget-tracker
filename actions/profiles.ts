"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Profile } from "@/types/database";
import { getUserCurrentMonth } from "@/utils/date-utils";

export async function getProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const fullName = formData.get("fullName") as string;
  const currency = formData.get("currency") as string;
  const timezone = formData.get("timezone") as string;
  const avatarFile = formData.get("avatarFile") as File;
  let avatarUrl = formData.get("avatarUrl") as string;

  // Handle avatar file upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true,
        contentType: avatarFile.type
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload avatar");
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    avatarUrl = publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      currency,
      timezone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getNetWorthHistory() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("net_worth_history")
    .select("*")
    .eq("user_id", user.id)
    .order("month", { ascending: true })
    .limit(12);

  if (error) {
    console.error("Error fetching net worth history:", error);
    return [];
  }

  return data;
}

export async function updateNetWorthSnapshot() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch current liquid cash from accounts
  const { data: profileData } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const userTimezone = profileData?.timezone || "UTC";

  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", user.id);
  
  const liquidCash = accounts?.reduce((acc, a) => acc + Number(a.balance), 0) || 0;

  // Fetch current invested value from investments
  const { data: investments } = await supabase
    .from("investments")
    .select("current_value, quantity")
    .eq("user_id", user.id);
  
  const investedValue = investments?.reduce((acc, inv) => acc + (Number(inv.current_value) * Number(inv.quantity)), 0) || 0;

  const totalNetWorth = liquidCash + investedValue;
  const month = getUserCurrentMonth(userTimezone);

  const { error } = await supabase
    .from("net_worth_history")
    .upsert({
      user_id: user.id,
      month,
      liquid_cash: liquidCash,
      invested_value: investedValue,
      total_net_worth: totalNetWorth,
    }, {
      onConflict: 'user_id, month'
    });

  if (error) {
    console.error("Error updating net worth snapshot:", error);
    return { error: error.message };
  }

  return { success: true };
}
