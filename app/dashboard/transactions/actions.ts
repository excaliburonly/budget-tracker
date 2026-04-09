"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Category, Transaction } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Category[]) || [];
}

export async function addCategory(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const color = formData.get("color") as string;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    color,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/transactions");
}

export async function addTransaction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as "income" | "expense";
  const category_id = formData.get("category_id") as string;
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    type,
    category_id: category_id || null,
    date,
    notes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
}

export async function getTransactions(): Promise<Transaction[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Transaction[]) || [];
}
