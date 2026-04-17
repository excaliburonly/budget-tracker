"use server";

import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";
import {Investment} from "@/types/database";
import {fetchMutualFundNAV} from "@/utils/nav-api";

export async function getInvestments(type?: string): Promise<Investment[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from("investments")
        .select("*")
        .order("created_at", {ascending: false});

    if (type) {
        query = query.eq("investment_type", type);
    }

    const {data, error} = await query;

    if (error) {
        console.error("Error fetching investments:", error);
        return [];
    }

    return (data as Investment[]) || [];
}

export async function addInvestment(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const asset_name = formData.get("asset_name") as string;
    const investment_type = formData.get("investment_type") as string;
    const symbol = formData.get("symbol") as string;
    const quantity = parseFloat(formData.get("quantity") as string);
    const invested_value = parseFloat(formData.get("invested_value") as string);
    const current_value = parseFloat(formData.get("current_value") as string);
    const average_buy_price = invested_value / quantity;
    const account_id = formData.get("account_id") as string;
    const date = new Date().toISOString().split('T')[0];

    // 1. Insert into investments
    const {data: investment, error: invError} = await supabase
        .from("investments")
        .insert([{
            user_id: user.id,
            asset_name,
            investment_type,
            symbol: symbol || null,
            quantity,
            average_buy_price,
            current_value,
            invested_value
        }])
        .select()
        .single();

    if (invError) {
        console.error("Error adding investment:", invError);
        return {error: invError.message};
    }

    // 2. Create a main transaction if account_id is provided
    let mainTransactionId = null;
    if (account_id) {
        const amount = invested_value;
        const {data: mainTx, error: txError} = await supabase
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
    const {error: invTxError} = await supabase
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
    return {success: true};
}

export async function addInvestmentTransaction(investmentId: string, formData: FormData): Promise<{
    error?: string;
    success?: boolean
}> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const type = formData.get("type") as 'buy' | 'sell';
    const quantity = parseFloat(formData.get("quantity") as string);
    const price = parseFloat(formData.get("price") as string);
    const date = formData.get("date") as string;
    const account_id = formData.get("account_id") as string;

    // 1. Get current investment data
    const {data: investment, error: fetchError} = await supabase
        .from("investments")
        .select("*")
        .eq("id", investmentId)
        .single();

    if (fetchError || !investment) {
        return {error: "Investment not found"};
    }

    // 2. Create main transaction
    let mainTransactionId = null;
    if (account_id) {
        const amount = quantity * price;
        const {data: mainTx, error: txError} = await supabase
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
    const {error: invTxError} = await supabase
        .from("investment_transactions")
        .insert([{
            investment_id: investment.id, transaction_id: mainTransactionId, type, quantity, price, date,
        }]);

    if (invTxError) return {error: invTxError.message};

    // 4. Update investment totals
    let newQuantity;
    let newInvestedValue = investment.invested_value || (investment.quantity * investment.average_buy_price);
    let newAvgPrice;

    if (type === 'buy') {
        newInvestedValue = newInvestedValue + (quantity * price);
        newQuantity = investment.quantity + quantity;
        newAvgPrice = newInvestedValue / newQuantity;
    } else {
        newQuantity = investment.quantity - quantity;
        // Proportionally reduce invested value (cost basis)
        const costOfSoldShares = (quantity / investment.quantity) * newInvestedValue;
        newInvestedValue = newInvestedValue - costOfSoldShares;
        // Average buy price usually stays the same on sell
        newAvgPrice = investment.average_buy_price;
    }

    const {error: updateError} = await supabase
        .from("investments")
        .update({
            quantity: newQuantity, 
            average_buy_price: newAvgPrice,
            invested_value: newInvestedValue
        })
        .eq("id", investmentId);

    if (updateError) return {error: updateError.message};

    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return {success: true};
}

export async function updateInvestment(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const asset_name = formData.get("asset_name") as string;
    const investment_type = formData.get("investment_type") as string;
    const symbol = formData.get("symbol") as string;
    const quantity = parseFloat(formData.get("quantity") as string);
    const invested_value = parseFloat(formData.get("invested_value") as string);
    const current_value = parseFloat(formData.get("current_value") as string);
    const average_buy_price = invested_value / quantity;

    const {error} = await supabase
        .from("investments")
        .update({
            asset_name, 
            investment_type, 
            symbol: symbol || null, 
            quantity, 
            average_buy_price, 
            current_value, 
            invested_value,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating investment:", error);
        return {error: error.message};
    }

    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard");
    return {success: true};
}

export async function syncMutualFundNAVs(): Promise<{ error?: string; success?: boolean; updatedCount?: number }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Fetch all mutual funds with a symbol
    const {data: investments, error: fetchError} = await supabase
        .from("investments")
        .select("*")
        .eq("investment_type", "Mutual Fund");

    if (fetchError) {
        console.error("Error fetching investments for sync:", fetchError);
        return {error: fetchError.message};
    }

    if (!investments || investments.length === 0) {
        return {success: true, updatedCount: 0};
    }

    let updatedCount = 0;
    for (const investment of investments) {
        if (!investment.symbol) continue;

        const latestNAV = await fetchMutualFundNAV(investment.symbol);
        if (latestNAV !== null) {
            const {error: updateError} = await supabase
                .from("investments")
                .update({
                    current_value: latestNAV, last_synced_at: new Date().toISOString()
                })
                .eq("id", investment.id);

            if (!updateError) {
                updatedCount++;
            } else {
                console.error(`Error updating NAV for ${investment.asset_name}:`, updateError);
            }
        }
    }

    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard");
    return {success: true, updatedCount};
}

export async function deleteInvestment(id: string): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {error} = await supabase
        .from("investments")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting investment:", error);
        return {error: error.message};
    }

    revalidatePath("/dashboard/investments");
    return {success: true};
}
