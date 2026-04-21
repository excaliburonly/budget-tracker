"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { EmergencyFund, EmergencyFundTransaction } from "@/types/database";

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
  const initial_amount = parseFloat(formData.get("initial_amount") as string) || 0;
  const account_id = formData.get("account_id") as string;
  const date = new Date().toISOString();

  const { data: fund, error } = await supabase
    .from("emergency_funds")
    .insert([{
      user_id: user.id,
      name,
      instrument_type,
      institution_name: institution_name || null,
      target_amount,
      current_amount: initial_amount,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating fund:", error);
    return { error: error.message };
  }

  // If initial amount > 0, create a main transaction and a fund transaction
  if (initial_amount > 0 && account_id) {
    const { data: mainTx, error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: user.id,
        amount: initial_amount,
        type: 'expense',
        account_id,
        emergency_fund_id: fund.id,
        date,
        notes: `Initial contribution to ${name}`,
      }])
      .select()
      .single();

    if (!txError) {
      await supabase.from("emergency_fund_transactions").insert([{
        emergency_fund_id: fund.id,
        transaction_id: mainTx.id,
        type: 'contribution',
        amount: initial_amount,
        date,
      }]);
    }
  }

  revalidatePath("/dashboard/emergency-funds");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addEmergencyFundTransaction(fundId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const type = formData.get("type") as 'contribution' | 'withdrawal';
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const timezoneOffset = parseInt(formData.get("timezoneOffset") as string || "0");
  const account_id = formData.get("account_id") as string;

  const dateTime = new Date(`${date}T${time}Z`);
  dateTime.setMinutes(dateTime.getMinutes() + timezoneOffset);
  const dateTimeISO = dateTime.toISOString();

  const { data: fund, error: fetchError } = await supabase
    .from("emergency_funds")
    .select("*")
    .eq("id", fundId)
    .single();

  if (fetchError || !fund) return { error: "Fund not found" };

  // 1. Create main transaction
  let mainTransactionId = null;
  if (account_id) {
    const { data: mainTx, error: txError } = await supabase
      .from("transactions")
      .insert([{
        user_id: user.id,
        amount,
        type: type === 'contribution' ? 'expense' : 'income',
        account_id,
        emergency_fund_id: fund.id,
        date: dateTimeISO,
        notes: `${type === 'contribution' ? 'Contributed to' : 'Withdrew from'} ${fund.name}`,
      }])
      .select()
      .single();

    if (!txError) mainTransactionId = mainTx.id;
  }

  // 2. Create fund transaction
  const { error: fundTxError } = await supabase
    .from("emergency_fund_transactions")
    .insert([{
      emergency_fund_id: fund.id,
      transaction_id: mainTransactionId,
      type,
      amount,
      date: dateTimeISO,
    }]);

  if (fundTxError) return { error: fundTxError.message };

  // 3. Update fund balance
  const newAmount = type === 'contribution' ? fund.current_amount + amount : fund.current_amount - amount;
  const { error: updateError } = await supabase
    .from("emergency_funds")
    .update({ current_amount: newAmount })
    .eq("id", fundId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/emergency-funds");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEmergencyFund(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const name = formData.get("name") as string;
  const instrument_type = formData.get("instrument_type") as string;
  const institution_name = formData.get("institution_name") as string;
  const target_amount = parseFloat(formData.get("target_amount") as string);

  const { error } = await supabase
    .from("emergency_funds")
    .update({
      name,
      instrument_type,
      institution_name: institution_name || null,
      target_amount,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating fund:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/emergency-funds");
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

export async function getEmergencyFundTransactions(fundId?: string): Promise<EmergencyFundTransaction[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("emergency_fund_transactions")
    .select(`
      *,
      emergency_funds (
        name,
        instrument_type
      ),
      transactions (
        notes,
        accounts!transactions_account_id_fkey (
          name
        )
      )
    `)
    .order("date", { ascending: false });

  if (fundId) {
    query = query.eq("emergency_fund_id", fundId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching emergency fund transactions:", error);
    return [];
  }

  return data || [];
}
