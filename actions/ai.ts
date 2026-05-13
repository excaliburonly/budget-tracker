"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function generateFinancialInsights() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from environment variables");
    return { 
      error: "GEMINI_API_KEY is not configured. Please add it to your environment variables." 
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthString = now.toISOString().slice(0, 7); // YYYY-MM

  // Fetch transactions for the current month
  const { data: transactions, error: tError } = await supabase
    .from("transactions")
    .select(`
      amount,
      type,
      date,
      categories (
        name
      )
    `)
    .gte("date", startOfMonth)
    .eq("user_id", user.id);

  if (tError) {
    console.error("Error fetching transactions for AI:", tError);
  }

  // Fetch budgets for the current month
  const { data: budgets, error: bError } = await supabase
    .from("budgets")
    .select(`
      amount,
      categories (
        name
      )
    `)
    .eq("month", monthString)
    .eq("user_id", user.id);

  if (bError) {
    console.error("Error fetching budgets for AI:", bError);
  }

  // Fetch user currency from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  const userCurrency = profile?.currency || "INR";

  const context = {
    transactions: transactions?.map(t => ({
      amount: t.amount,
      type: t.type,
      date: t.date,
      category: Array.isArray(t.categories) ? (t.categories as { name: string }[])[0]?.name : (t.categories as { name: string } | null)?.name || "Uncategorized"
    })),
    budgets: budgets?.map(b => ({
      category: Array.isArray(b.categories) ? (b.categories as { name: string }[])[0]?.name : (b.categories as { name: string } | null)?.name,
      budgeted: b.amount
    })),
    month: monthString,
    currentDate: now.toISOString().split('T')[0],
    currency: userCurrency
  };

  const model = genAI.getGenerativeModel(
    { model: "gemini-flash-latest" },
    { apiVersion: "v1beta" }
  );

  const prompt = `
    You are a professional financial advisor assistant for "Ledgr", a personal finance app. 
    Analyze the following financial data for the user for the month of ${monthString}.
    
    Current Date: ${context.currentDate}
    User Currency: ${userCurrency}

    Data:
    ${JSON.stringify(context, null, 2)}

    Provide a concise, helpful, and professional analysis in JSON format with the following structure:
    {
      "recap": "A 2-3 sentence summary of the overall spending, income performance, and investment/savings activity this month. Mention amounts in ${userCurrency}.",
      "anomalies": ["A list of 1-3 unusual spending patterns, spikes, or large transactions. Mention amounts in ${userCurrency}. NOTE: Do NOT flag large 'investment' type transactions as anomalies as they are intentional savings. If none, return an empty array."],
      "optimizations": ["2-3 actionable suggestions on where to save money or reallocate budget based on spending vs budgets. Mention amounts in ${userCurrency}."]
    }

    Rules:
    - Return ONLY the JSON object.
    - Keep the tone encouraging and professional.
    - If there is very little data, provide a summary of what is there and general financial advice.
    - Focus on categories where spending is high.
    - Compare spending to budgets where applicable.
    - Distinguish between 'expense' (money gone) and 'investment' (money saved/invested). Do NOT treat investments as negative spending.
    - ALL currency values and mentions MUST be in ${userCurrency}. Do NOT use USD or $.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    try {
      return JSON.parse(text);
    } catch {
      console.error("Error parsing AI response as JSON:", text);
      throw new Error("Invalid JSON response from AI");
    }
  } catch (error) {
    console.error("Detailed error generating AI insights:", error);
    let errorMessage = "Failed to generate insights. Please try again later.";
    const err = error as Error;
    if (err.message?.includes("API key not valid")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY.";
    } else if (err.message) {
      errorMessage = `AI Error: ${err.message}`;
    }
    return { error: errorMessage };
  }
}

interface InsightData {
  recap: string;
  anomalies: string[];
  optimizations: string[];
}

interface WhatIfParams {
  monthlyIncomeChange: number;
  monthlyExpenseChange: number;
  monthlyInvestmentChange: number;
  years: number;
}

export async function runWhatIfSimulation(params: WhatIfParams) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, currency")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== 'premium') {
    return { error: "PREMIUM_REQUIRED", message: "The What-If Simulator is a premium feature. Please upgrade to access." };
  }

  const userCurrency = profile?.currency || "INR";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);

  const [accounts, investments, goals] = await Promise.all([
    supabase.from("accounts").select("balance").eq("user_id", user.id),
    supabase.from("investments").select("current_value, quantity, investment_type").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id)
  ]);

  const currentLiquidCash = accounts.data?.reduce((acc, a) => acc + Number(a.balance), 0) || 0;
  const currentInvestedValue = investments.data?.reduce((acc, inv) => acc + (Number(inv.current_value) * Number(inv.quantity)), 0) || 0;

  const context = {
    currentLiquidCash,
    currentInvestedValue,
    totalNetWorth: currentLiquidCash + currentInvestedValue,
    goals: goals.data,
    modifications: params,
    currency: userCurrency
  };

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are a high-level financial strategist for the "Ledgr" app. 
    Perform a "What-If" financial simulation based on the following data:
    
    User Data:
    ${JSON.stringify(context, null, 2)}

    Parameters for Simulation:
    - Increase/Decrease in Monthly Income: ${params.monthlyIncomeChange}
    - Increase/Decrease in Monthly Expenses: ${params.monthlyExpenseChange}
    - Increase/Decrease in Monthly Investment Contribution: ${params.monthlyInvestmentChange}
    - Simulation Horizon: ${params.years} years

    Provide a structured JSON response:
    {
      "projection": [
        {"year": 0, "netWorth": number, "liquid": number, "invested": number},
        ...
      ],
      "goalAnalysis": [
        {"goalName": string, "projectedAchievementDate": string, "isReached": boolean}
      ],
      "insight": "Analysis of how these changes impact wealth.",
      "recommendation": "One strategic move."
    }

    Rules:
    - Return ONLY the JSON object.
    - All monetary values must be in ${userCurrency}.
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*}/);
    if (jsonMatch) text = jsonMatch[0];
    return JSON.parse(text);
  } catch (error) {
    console.error("Simulation Error:", error);
    return { error: "Failed to run simulation" };
  }
}

export async function saveFinancialInsight(month: string, insightData: InsightData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ai_insights")
    .insert([{ user_id: user.id, month, insight_data: insightData }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function getSavedInsights(month?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("ai_insights").select("*").order("created_at", { ascending: false });
  if (month) query = query.eq("month", month);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function deleteFinancialInsight(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("ai_insights").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function suggestTransactionCategory(note: string, type: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== 'premium') {
    return { error: "PREMIUM_REQUIRED", message: "AI Auto-categorization is a premium feature. Please upgrade to access." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);

  // Fetch all available categories for this user
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .eq("type", type);

  if (!categories || categories.length === 0) return null;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a financial assistant for the "Ledgr" app. 
    Based on the transaction note provided, pick the most appropriate category from the list below.
    
    Transaction Note: "${note}"
    Transaction Type: ${type}

    Available Categories:
    ${categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n")}

    Rules:
    - Return ONLY the ID of the best matching category.
    - If no category matches well, return "null".
    - Be smart: "Uber" should be Transport, "Starbucks" should be Dining & Food, etc.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Validate that the returned text is one of the category IDs
    const matchedCategory = categories.find(c => text.includes(c.id));
    return matchedCategory ? matchedCategory.id : null;
  } catch (error) {
    console.error("Auto-categorization error:", error);
    return null;
  }
}

export async function generateFinancialHealthReport() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 7);

  const [currTransactions, currBudgets, accounts, investments] = await Promise.all([
    supabase.from("transactions").select("amount, type, date, categories(name)").gte("date", currentMonth + "-01").eq("user_id", user.id),
    supabase.from("budgets").select("amount, categories(name)").eq("month", currentMonth).eq("user_id", user.id),
    supabase.from("accounts").select("balance, type").eq("user_id", user.id),
    supabase.from("investments").select("current_value, quantity").eq("user_id", user.id)
  ]);

  const [prevTransactions, prevBudgets] = await Promise.all([
    supabase.from("transactions").select("amount, type, date, categories(name)").gte("date", prevMonth + "-01").lt("date", currentMonth + "-01").eq("user_id", user.id),
    supabase.from("budgets").select("amount, categories(name)").eq("month", prevMonth).eq("user_id", user.id)
  ]);

  const profile = await supabase.from("profiles").select("currency").eq("id", user.id).single();
  const currency = profile.data?.currency || "INR";

  const calculateStats = (txs: { amount: number | string; type: string }[]) => {
    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const investments = txs.filter(t => t.type === 'investment').reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expenses, investments, totalOut: expenses + investments };
  };

  const currStats = calculateStats(currTransactions.data || []);
  const prevStats = calculateStats(prevTransactions.data || []);

  const liquidCash = accounts.data?.reduce((acc, a) => acc + Number(a.balance), 0) || 0;
  const investmentValue = investments.data?.reduce((acc, inv) => acc + (Number(inv.current_value) * Number(inv.quantity)), 0) || 0;
  const netWorth = liquidCash + investmentValue;

  const context = {
    currentMonth: {
      stats: currStats,
      transactions: currTransactions.data?.map(t => ({ 
        amount: t.amount, 
        type: t.type, 
        category: Array.isArray(t.categories) ? (t.categories as { name: string }[])[0]?.name : (t.categories as { name: string } | null)?.name 
      })),
      budgets: currBudgets.data
    },
    previousMonth: {
      stats: prevStats,
      transactions: prevTransactions.data?.map(t => ({ 
        amount: t.amount, 
        type: t.type, 
        category: Array.isArray(t.categories) ? (t.categories as { name: string }[])[0]?.name : (t.categories as { name: string } | null)?.name 
      })),
      budgets: prevBudgets.data
    },
    netWorth,
    currency
  };

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert financial analyst. Generate a "State of the Union" financial health report for a user based on their data for ${currentMonth} compared to ${prevMonth}.
    
    Data:
    ${JSON.stringify(context, null, 2)}

    Format your response as a JSON object:
    {
      "title": "Professional title",
      "summary": "Overview of financial health.",
      "wins": ["List of achievements"],
      "concerns": ["Areas for focus"],
      "metrics": [
        {"label": "Savings Rate", "value": "percentage", "trend": "up/down/stable", "description": "brief"},
        {"label": "Expense Delta", "value": "currency", "trend": "up/down/stable", "description": "comparison"},
        {"label": "Net Worth Growth", "value": "currency", "trend": "up/down/stable", "description": "change"}
      ],
      "strategicAdvice": "One bold advice."
    }

    Rules:
    - ALL currency must be in ${currency}.
    - Return ONLY the JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*}/);
    if (jsonMatch) text = jsonMatch[0];
    return JSON.parse(text);
  } catch (error) {
    console.error("Health Report Error:", error);
    return { error: "Failed to generate health report" };
  }
}
