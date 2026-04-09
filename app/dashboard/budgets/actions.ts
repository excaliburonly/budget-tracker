"use server";

import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";

export async function getBudgets(month?: string): Promise<Budget[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const query = supabase
    .from("budgets")
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `);

  if (month) {
    query.eq("month", month);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }

  return (data as Budget[]) || [];
}

export async function createBudget(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const category_id = formData.get("category_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const month = formData.get("month") as string || new Date().toISOString().slice(0, 7);

  const { error } = await supabase
    .from("budgets")
    .insert([{
      user_id: user.id,
      category_id,
      amount,
      month,
    }]);

  if (error) {
    console.error("Error creating budget:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBudget(id: string, amount: number): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("budgets")
    .update({ amount })
    .eq("id", id);

  if (error) {
    console.error("Error updating budget:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(id: string): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting budget:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}
