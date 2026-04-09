"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { EmergencyFund } from "@/types/database";

export async function getEmergencyFunds(): Promise<EmergencyFund[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("emergency_funds")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching emergency funds:", error);
    return [];
  }

  return (data as EmergencyFund[]) || [];
}

export async function createEmergencyFund(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const instrument_type = formData.get("instrument_type") as string;
  const institution_name = formData.get("institution_name") as string;
  const target_amount = parseFloat(formData.get("target_amount") as string);

  const { error } = await supabase
    .from("emergency_funds")
    .insert([{
      user_id: user.id,
      name,
      instrument_type,
      institution_name: institution_name || null,
      target_amount,
      current_amount: 0,
    }]);

  if (error) {
    console.error("Error creating fund:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/emergency-funds");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEmergencyFund(id: string): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("emergency_funds")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting fund:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/emergency-funds");
  return { success: true };
}
