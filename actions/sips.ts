"use server";

import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";
import {SIP} from "@/types/database";

export async function getSIPs(): Promise<SIP[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return [];

    const {data, error} = await supabase
        .from("sips")
        .select(`
            *,
            investments (
                asset_name,
                investment_type
            )
        `)
        .eq("user_id", user.id)
        .order("next_date", {ascending: true});

    if (error) {
        console.error("Error fetching SIPs:", error);
        return [];
    }
    return (data as unknown as SIP[]) || [];
}

export async function addSIP(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const investment_id = formData.get("investment_id") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const frequency = formData.get("frequency") as string;
    const next_date = formData.get("next_date") as string;

    const {error} = await supabase.from("sips").insert([{
        user_id: user.id,
        investment_id,
        amount,
        frequency,
        next_date,
        status: 'active'
    }]);

    if (error) return {error: error.message};

    revalidatePath("/dashboard/investments/sips");
    return {success: true};
}

export async function updateSIP(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const amount = parseFloat(formData.get("amount") as string);
    const frequency = formData.get("frequency") as string;
    const next_date = formData.get("next_date") as string;
    const status = formData.get("status") as 'active' | 'paused' | 'completed';

    const {error} = await supabase.from("sips").update({
        amount,
        frequency,
        next_date,
        status
    }).eq("id", id);

    if (error) return {error: error.message};

    revalidatePath("/dashboard/investments/sips");
    return {success: true};
}

export async function deleteSIP(id: string): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {error} = await supabase.from("sips").delete().eq("id", id);
    if (error) return {error: error.message};
    revalidatePath("/dashboard/investments/sips");
    return {success: true};
}

export async function logSIPTransaction(sipId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const amount = parseFloat(formData.get("amount") as string);
    const quantity = parseFloat(formData.get("quantity") as string);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const timezoneOffset = parseInt(formData.get("timezoneOffset") as string || "0");
    const account_id = formData.get("account_id") as string;
    const price = amount / quantity;

    const dateTime = new Date(`${date}T${time}Z`);
    dateTime.setMinutes(dateTime.getMinutes() + timezoneOffset);
    const dateTimeISO = dateTime.toISOString();

    // 1. Get SIP and Investment details
    const {data: sip, error: sipError} = await supabase
        .from("sips")
        .select("*, investments(*)")
        .eq("id", sipId)
        .single();
    
    if (sipError || !sip) return {error: "SIP not found"};
    const investment = sip.investments;

    // 2. Create main transaction
    let mainTransactionId = null;
    if (account_id) {
        const {data: mainTx, error: txError} = await supabase.from("transactions").insert([{
            user_id: user.id,
            amount,
            type: 'investment',
            account_id,
            investment_id: investment.id,
            date: dateTimeISO,
            notes: `SIP Payment for ${investment.asset_name}`,
        }]).select().single();
        if (!txError) mainTransactionId = mainTx.id;
    }

    // 3. Create investment transaction
    const {error: invTxError} = await supabase.from("investment_transactions").insert([{
        investment_id: investment.id,
        transaction_id: mainTransactionId,
        type: 'buy',
        quantity,
        price,
        date: dateTimeISO,
    }]);
    if (invTxError) return {error: invTxError.message};

    // 4. Update investment holding
    const newQuantity = (investment.quantity || 0) + quantity;
    const newInvestedValue = (investment.invested_value || 0) + amount;
    const newAvgPrice = newInvestedValue / newQuantity;

    await supabase.from("investments").update({
        quantity: newQuantity,
        average_buy_price: newAvgPrice,
        invested_value: newInvestedValue
    }).eq("id", investment.id);

    // 5. Advance next_date of SIP
    const nextDate = new Date(sip.next_date);
    if (sip.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (sip.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
    } else if (sip.frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
    }
    
    await supabase.from("sips").update({
        next_date: nextDate.toISOString().split('T')[0]
    }).eq("id", sipId);

    revalidatePath("/dashboard/investments/sips");
    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return {success: true};
}
