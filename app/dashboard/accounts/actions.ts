"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Account } from "@/types/database";

export async function getAccounts(): Promise<Account[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }

  return (data as Account[]) || [];
}

export async function addAccount(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const balance = parseFloat(formData.get("balance") as string);

  const { error } = await supabase
    .from("accounts")
    .insert([{
      user_id: user.id,
      name,
      type,
      balance,
    }]);

  if (error) {
    console.error("Error adding account:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAccount(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const balance = parseFloat(formData.get("balance") as string);

  const { error } = await supabase
    .from("accounts")
    .update({ name, type, balance })
    .eq("id", id);

  if (error) {
    console.error("Error updating account:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccount(id: string): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting account:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}
