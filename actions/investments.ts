"use server";

import {createClient} from "@/utils/supabase/server";
import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";
import {Investment, InvestmentTransaction} from "@/types/database";
import {fetchMutualFundNAV, fetchHistoricalNAVs, fetchHistoricalStockPrices} from "@/utils/nav-api";

export interface PerformancePoint {
    date: string;
    invested: number;
    value: number;
}

export async function getInvestmentPerformance(type?: string): Promise<PerformancePoint[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get all investments and transactions
    let invQuery = supabase.from("investments").select("*").eq("user_id", user.id);
    if (type) invQuery = invQuery.eq("investment_type", type);

    const {data: investments} = await invQuery;
    if (!investments || investments.length === 0) return [];

    const {data: allTransactions} = await supabase.from("investment_transactions").select(`
            *,
            investments!inner (
                user_id,
                symbol,
                investment_type,
                asset_name
            )
        `)
        .eq("investments.user_id", user.id)
        .in("investment_id", investments.map(i => i.id))
        .order("date", {ascending: true});

    if (!allTransactions || allTransactions.length === 0) {
        const totalInvested = investments.reduce((acc, i) => acc + (Number(i.invested_value) || 0), 0);
        const totalValue = investments.reduce((acc, i) => acc + (Number(i.current_value) * Number(i.quantity)), 0);
        return [
            { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], invested: totalInvested, value: totalInvested },
            { date: new Date().toISOString().split('T')[0], invested: totalInvested, value: totalValue }
        ];
    }

    const startDate = new Date(allTransactions[0].date);
    const endDate = new Date();
    const days: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().split('T')[0]);
    }

    const priceCache: Record<string, Record<string, number>> = {};
    await Promise.all(investments.map(async (inv) => {
        if (!inv.symbol) return;
        if (inv.investment_type === 'Mutual Fund') {
            priceCache[inv.id] = await fetchHistoricalNAVs(inv.symbol);
        } else if (inv.investment_type === 'Stock') {
            priceCache[inv.id] = await fetchHistoricalStockPrices(inv.symbol, startDate.toISOString(), endDate.toISOString());
        }
    }));

    const performance: PerformancePoint[] = [];
    const portfolio: Record<string, { quantity: number; costBasis: number }> = {};
    const txByDate: Record<string, typeof allTransactions> = {};
    allTransactions.forEach(tx => {
        const d = tx.date.split('T')[0];
        if (!txByDate[d]) txByDate[d] = [];
        txByDate[d].push(tx);
    });

    days.forEach(day => {
        if (txByDate[day]) {
            txByDate[day].forEach(tx => {
                if (!portfolio[tx.investment_id]) portfolio[tx.investment_id] = { quantity: 0, costBasis: 0 };
                const p = portfolio[tx.investment_id];
                if (tx.type === 'buy') {
                    p.quantity += tx.quantity;
                    p.costBasis += tx.quantity * tx.price;
                } else if (tx.type === 'sell') {
                    const sellFraction = tx.quantity / p.quantity;
                    p.costBasis -= p.costBasis * sellFraction;
                    p.quantity -= tx.quantity;
                }
            });
        }

        let dailyInvested = 0;
        let dailyValue = 0;
        Object.keys(portfolio).forEach(invId => {
            const p = portfolio[invId];
            if (p.quantity <= 0) return;
            dailyInvested += p.costBasis;
            let price = 0;
            for (let i = 0; i < 7; i++) {
                const lookbackDay = new Date(day);
                lookbackDay.setDate(lookbackDay.getDate() - i);
                const lookbackStr = lookbackDay.toISOString().split('T')[0];
                if (priceCache[invId]?.[lookbackStr]) {
                    price = priceCache[invId][lookbackStr];
                    break;
                }
            }
            if (price === 0) {
                const inv = investments.find(i => i.id === invId);
                price = inv?.current_value || (p.costBasis / p.quantity);
            }
            dailyValue += p.quantity * price;
        });

        performance.push({ date: day, invested: Math.round(dailyInvested), value: Math.round(dailyValue) });
    });

    if (performance.length > 60) {
        const step = Math.floor(performance.length / 30);
        const result = performance.filter((_, i) => i % step === 0 || i === performance.length - 1);
        if (result[result.length-1].date !== performance[performance.length-1].date) result.push(performance[performance.length-1]);
        return result;
    }
    return performance;
}

export async function getInvestments(type?: string): Promise<Investment[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    let query = supabase.from("investments").select("*").order("created_at", {ascending: false});
    if (type) query = query.eq("investment_type", type);
    const {data, error} = await query;
    if (error) return [];
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
    const date = new Date().toISOString();

    const {data: investment, error: invError} = await supabase.from("investments").insert([{
        user_id: user.id, asset_name, investment_type, symbol: symbol || null, quantity, average_buy_price, current_value, invested_value
    }]).select().single();

    if (invError) return {error: invError.message};

    let mainTransactionId = null;
    if (account_id) {
        const {data: mainTx, error: txError} = await supabase.from("transactions").insert([{
            user_id: user.id, amount: invested_value, type: 'investment', account_id, investment_id: investment.id, date, notes: `Initial purchase of ${asset_name}`,
        }]).select().single();
        if (!txError) mainTransactionId = mainTx.id;
    }

    await supabase.from("investment_transactions").insert([{
        investment_id: investment.id, transaction_id: mainTransactionId, type: 'buy', quantity, price: average_buy_price, date,
    }]);

    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return {success: true};
}

export async function addInvestmentTransaction(investmentId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const type = formData.get("type") as 'buy' | 'sell';
    const quantity = parseFloat(formData.get("quantity") as string);
    const price = parseFloat(formData.get("price") as string);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const timezoneOffset = parseInt(formData.get("timezoneOffset") as string || "0");
    const account_id = formData.get("account_id") as string;

    const dateTime = new Date(`${date}T${time}Z`);
    dateTime.setMinutes(dateTime.getMinutes() + timezoneOffset);
    const dateTimeISO = dateTime.toISOString();

    const {data: investment, error: fetchError} = await supabase.from("investments").select("*").eq("id", investmentId).single();
    if (fetchError || !investment) return {error: "Investment not found"};

    let mainTransactionId = null;
    if (account_id) {
        const {data: mainTx, error: txError} = await supabase.from("transactions").insert([{
            user_id: user.id, amount: quantity * price, type: type === 'buy' ? 'investment' : 'income', account_id, investment_id: investment.id, date: dateTimeISO, notes: `${type === 'buy' ? 'Bought' : 'Sold'} ${quantity} units of ${investment.asset_name}`,
        }]).select().single();
        if (!txError) mainTransactionId = mainTx.id;
    }

    const {error: invTxError} = await supabase.from("investment_transactions").insert([{
        investment_id: investment.id, transaction_id: mainTransactionId, type, quantity, price, date: dateTimeISO,
    }]);
    if (invTxError) return {error: invTxError.message};

    const newQuantity = type === 'buy' ? investment.quantity + quantity : investment.quantity - quantity;
    const newInvestedValue = type === 'buy' ? (investment.invested_value || 0) + (quantity * price) : (investment.invested_value || 0) - ((quantity / investment.quantity) * (investment.invested_value || 0));
    const newAvgPrice = type === 'buy' ? newInvestedValue / newQuantity : investment.average_buy_price;

    await supabase.from("investments").update({ quantity: newQuantity, average_buy_price: newAvgPrice, invested_value: newInvestedValue }).eq("id", investmentId);

    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard");
    return {success: true};
}

export async function getInvestmentTransactions(investmentId?: string): Promise<InvestmentTransaction[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from("investment_transactions")
        .select(`
            *,
            investments!inner (
                user_id,
                asset_name,
                investment_type
            ),
            transactions (
                notes,
                accounts!transactions_account_id_fkey (
                    name
                )
            )
        `)
        .eq("investments.user_id", user.id)
        .order("date", {ascending: false});

    if (investmentId) query = query.eq("investment_id", investmentId);
    const {data, error} = await query;
    if (error) {
        console.error("Error fetching investment transactions:", error);
        return [];
    }
    return data || [];
}

export async function getIndividualInvestmentPerformance(investmentId: string): Promise<PerformancePoint[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: investment} = await supabase.from("investments").select("*").eq("id", investmentId).single();
    if (!investment) return [];

    const {data: allTransactions} = await supabase.from("investment_transactions").select("*").eq("investment_id", investmentId).order("date", {ascending: true});
    if (!allTransactions || allTransactions.length === 0) return [];

    const startDate = new Date(allTransactions[0].date);
    const endDate = new Date();
    const days: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) days.push(d.toISOString().split('T')[0]);

    let priceHistory: Record<string, number> = {};
    if (investment.symbol) {
        if (investment.investment_type === 'Mutual Fund') priceHistory = await fetchHistoricalNAVs(investment.symbol);
        else if (investment.investment_type === 'Stock') priceHistory = await fetchHistoricalStockPrices(investment.symbol, startDate.toISOString(), endDate.toISOString());
    }

    const performance: PerformancePoint[] = [];
    let currentQuantity = 0;
    let currentCostBasis = 0;
    const txByDate: Record<string, typeof allTransactions> = {};
    allTransactions.forEach(tx => {
        const d = tx.date.split('T')[0];
        if (!txByDate[d]) txByDate[d] = [];
        txByDate[d].push(tx);
    });

    days.forEach(day => {
        if (txByDate[day]) {
            txByDate[day].forEach(tx => {
                if (tx.type === 'buy') {
                    currentQuantity += tx.quantity;
                    currentCostBasis += tx.quantity * tx.price;
                } else {
                    const sellFraction = tx.quantity / currentQuantity;
                    currentCostBasis -= currentCostBasis * sellFraction;
                    currentQuantity -= tx.quantity;
                }
            });
        }
        let price = 0;
        for (let i = 0; i < 7; i++) {
            const lookbackDay = new Date(day);
            lookbackDay.setDate(lookbackDay.getDate() - i);
            const lookbackStr = lookbackDay.toISOString().split('T')[0];
            if (priceHistory[lookbackStr]) {
                price = priceHistory[lookbackStr];
                break;
            }
        }
        if (price === 0) price = investment.current_value || (currentCostBasis / currentQuantity);
        performance.push({ date: day, invested: Math.round(currentCostBasis), value: Math.round(currentQuantity * price) });
    });
    return performance;
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

    const {error} = await supabase.from("investments").update({
        asset_name, investment_type, symbol: symbol || null, quantity, average_buy_price, current_value, invested_value,
    }).eq("id", id);
    if (error) return {error: error.message};
    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard");
    return {success: true};
}

export async function syncMutualFundNAVs(): Promise<{ error?: string; success?: boolean; updatedCount?: number }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: investments, error: fetchError} = await supabase.from("investments").select("*").eq("investment_type", "Mutual Fund");
    if (fetchError) return {error: fetchError.message};
    if (!investments || investments.length === 0) return {success: true, updatedCount: 0};

    let updatedCount = 0;
    for (const investment of investments) {
        if (!investment.symbol) continue;
        const latestNAV = await fetchMutualFundNAV(investment.symbol);
        if (latestNAV !== null) {
            const {error: updateError} = await supabase.from("investments").update({ current_value: latestNAV, last_synced_at: new Date().toISOString() }).eq("id", investment.id);
            if (!updateError) updatedCount++;
        }
    }
    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard");
    return {success: true, updatedCount};
}

export async function syncStockPrices(): Promise<{ error?: string; success?: boolean; updatedCount?: number }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {data: investments, error: fetchError} = await supabase.from("investments").select("*").eq("investment_type", "Stock");
    if (fetchError) return {error: fetchError.message};
    if (!investments || investments.length === 0) return {success: true, updatedCount: 0};

    let updatedCount = 0;
    for (const investment of investments) {
        if (!investment.symbol) continue;
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${investment.symbol}?interval=1m&range=1d`);
            const json = await response.json();
            const result = json.chart?.result?.[0];
            if (result && result.meta?.regularMarketPrice) {
                const latestPrice = result.meta.regularMarketPrice;
                const {error: updateError} = await supabase.from("investments").update({ current_value: latestPrice, last_synced_at: new Date().toISOString() }).eq("id", investment.id);
                if (!updateError) updatedCount++;
            }
        } catch (e) {
            console.error(`Failed to sync price for ${investment.asset_name}:`, e);
        }
    }
    revalidatePath("/dashboard/investments");
    revalidatePath("/dashboard");
    return {success: true, updatedCount};
}

export async function deleteInvestment(id: string): Promise<{ error?: string; success?: boolean }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {error} = await supabase.from("investments").delete().eq("id", id);
    if (error) return {error: error.message};
    revalidatePath("/dashboard/investments");
    return {success: true};
}
