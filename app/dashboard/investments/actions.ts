"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Investment } from "@/types/database";

export async function getInvestments(): Promise<Investment[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching investments:", error);
    return [];
  }

  return (data as Investment[]) || [];
}

export async function addInvestment(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const asset_name = formData.get("asset_name") as string;
  const symbol = formData.get("symbol") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const average_buy_price = parseFloat(formData.get("average_buy_price") as string);
  const current_value = parseFloat(formData.get("current_value") as string);

  const { error } = await supabase
    .from("investments")
    .insert([{
      user_id: user.id,
      asset_name,
      symbol: symbol || null,
      quantity,
      average_buy_price,
      current_value,
    }]);

  if (error) {
    console.error("Error adding investment:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInvestmentValue(id: string, current_value: number): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("investments")
    .update({ current_value })
    .eq("id", id);

  if (error) {
    console.error("Error updating investment:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/investments");
  return { success: true };
}

export async function deleteInvestment(id: string): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting investment:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/investments");
  return { success: true };
}
