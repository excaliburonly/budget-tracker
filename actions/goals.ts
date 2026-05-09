"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Goal, GoalAllocation } from "@/types/database";

export async function getGoals(): Promise<Goal[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  return (data as Goal[]) || [];
}

export async function getGoalAllocations(): Promise<GoalAllocation[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
  
    const { data, error } = await supabase
      .from("goal_allocations")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching goal allocations:", error);
      return [];
    }
  
    return (data as GoalAllocation[]) || [];
  }

export async function createGoal(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const target_amount = parseFloat(formData.get("target_amount") as string);
  const deadline = formData.get("deadline") as string || null;

  const { error } = await supabase
    .from("goals")
    .insert([{
      user_id: user.id,
      name,
      target_amount,
      deadline,
    }]);

  if (error) {
    console.error("Error creating goal:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGoal(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const name = formData.get("name") as string;
  const target_amount = parseFloat(formData.get("target_amount") as string);
  const deadline = formData.get("deadline") as string || null;

  const { error } = await supabase
    .from("goals")
    .update({
      name,
      target_amount,
      deadline,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating goal:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGoal(id: string): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting goal:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveAllocations(goalId: string, allocations: { asset_type: 'account' | 'investment', asset_id: string, percentage: number }[]): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Delete existing allocations for this goal
    const { error: delError } = await supabase
        .from("goal_allocations")
        .delete()
        .eq("goal_id", goalId);

    if (delError) return { error: delError.message };

    // 2. Insert new allocations
    if (allocations.length > 0) {
        const { error: insError } = await supabase
            .from("goal_allocations")
            .insert(allocations.map(a => ({
                goal_id: goalId,
                ...a
            })));

        if (insError) return { error: insError.message };
    }

    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard");
    return { success: true };
}
