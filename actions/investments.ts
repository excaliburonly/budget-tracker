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
  const investment_type = formData.get("investment_type") as string;
  const symbol = formData.get("symbol") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const average_buy_price = parseFloat(formData.get("average_buy_price") as string);
  const current_value = parseFloat(formData.get("current_value") as string);
  const account_id = formData.get("account_id") as string;
  const date = new Date().toISOString().split('T')[0];

  // 1. Insert into investments
  const { data: investment, error: invError } = await supabase
    .from("investments")
    .insert([{
      user_id: user.id,
      asset_name,
      investment_type,
      symbol: symbol || null,
      quantity,
      average_buy_price,
      current_value,
    }])
    .select()
    .single();

  if (invError) {
    console.error("Error adding investment:", invError);
    return { error: invError.message };
  }

  // 2. Create a main transaction if account_id is provided
  let mainTransactionId = null;
  if (account_id) {
    const amount = quantity * average_buy_price;
    const { data: mainTx, error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: user.id,
        amount,
        type: 'expense',
        account_id,
        investment_id: investment.id,
        date,
        notes: `Initial purchase of ${asset_name}`,
      }])
      .select()
      .single();

    if (txError) {
      console.error("Error creating main transaction:", txError);
      // We don't fail the whole thing, but it's an issue
    } else {
      mainTransactionId = mainTx.id;
    }
  }

  // 3. Create an investment transaction
  const { error: invTxError } = await supabase
    .from("investment_transactions")
    .insert([{
      investment_id: investment.id,
      transaction_id: mainTransactionId,
      type: 'buy',
      quantity,
      price: average_buy_price,
      date,
    }]);

  if (invTxError) {
    console.error("Error creating investment transaction:", invTxError);
  }

  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addInvestmentTransaction(investmentId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const type = formData.get("type") as 'buy' | 'sell';
  const quantity = parseFloat(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const date = formData.get("date") as string;
  const account_id = formData.get("account_id") as string;

  // 1. Get current investment data
  const { data: investment, error: fetchError } = await supabase
    .from("investments")
    .select("*")
    .eq("id", investmentId)
    .single();

  if (fetchError || !investment) {
    return { error: "Investment not found" };
  }

  // 2. Create main transaction
  let mainTransactionId = null;
  if (account_id) {
    const amount = quantity * price;
    const { data: mainTx, error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: user.id,
        amount,
        type: type === 'buy' ? 'expense' : 'income',
        account_id,
        investment_id: investment.id,
        date,
        notes: `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} units of ${investment.asset_name}`,
      }])
      .select()
      .single();

    if (!txError) {
      mainTransactionId = mainTx.id;
    }
  }

  // 3. Create investment transaction
  const { error: invTxError } = await supabase
    .from("investment_transactions")
    .insert([{
      investment_id: investment.id,
      transaction_id: mainTransactionId,
      type,
      quantity,
      price,
      date,
    }]);

  if (invTxError) return { error: invTxError.message };

  // 4. Update investment totals (weighted average price)
  let newQuantity = investment.quantity;
  let newAvgPrice = investment.average_buy_price;

  if (type === 'buy') {
    newAvgPrice = ((investment.quantity * investment.average_buy_price) + (quantity * price)) / (investment.quantity + quantity);
    newQuantity = investment.quantity + quantity;
  } else {
    newQuantity = investment.quantity - quantity;
    // Average buy price usually stays the same on sell, or it's handled differently.
    // In many trackers, avg buy price remains constant unless you sell at a specific lot.
    // For simplicity, we keep it same on sell but reduce quantity.
  }

  const { error: updateError } = await supabase
    .from("investments")
    .update({
      quantity: newQuantity,
      average_buy_price: newAvgPrice
    })
    .eq("id", investmentId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInvestment(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const asset_name = formData.get("asset_name") as string;
  const investment_type = formData.get("investment_type") as string;
  const symbol = formData.get("symbol") as string;
  const quantity = parseFloat(formData.get("quantity") as string);
  const average_buy_price = parseFloat(formData.get("average_buy_price") as string);
  const current_value = parseFloat(formData.get("current_value") as string);

  const { error } = await supabase
    .from("investments")
    .update({
      asset_name,
      investment_type,
      symbol: symbol || null,
      quantity,
      average_buy_price,
      current_value,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating investment:", error);
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
