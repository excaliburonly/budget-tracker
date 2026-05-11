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

  console.log("GEMINI_API_KEY found, length:", apiKey.length);

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
      category: (t.categories as unknown as { name: string })?.name || "Uncategorized"
    })),
    budgets: budgets?.map(b => ({
      category: (b.categories as unknown as { name: string })?.name,
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
    
    // Extract JSON if it's wrapped in Markdown or has filler text
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
    
    // Provide more helpful error messages
    let errorMessage = "Failed to generate insights. Please try again later.";
    const err = error as Error;
    
    if (err.message?.includes("API key not valid")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY.";
    } else if (err.message?.includes("blocked")) {
      errorMessage = "The AI response was blocked by safety filters. Try adding more transaction data.";
    } else if (err.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (err.message) {
      // Return the actual error message for debugging purposes (can be refined later for production)
      errorMessage = `AI Error: ${err.message}`;
    }
    
    return { 
      error: errorMessage 
    };
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

  // Check subscription tier
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

  // Fetch current financial snapshot
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

    Assumptions:
    - Use a conservative 10-12% annual return for Mutual Funds/Stocks.
    - Use a 5-6% annual return for liquid cash (savings/FDs).
    - Account for a 5% annual inflation rate in your commentary.

    Provide a structured JSON response:
    {
      "projection": [
        {"year": 0, "netWorth": number, "liquid": number, "invested": number},
        ... (one entry per year for the horizon)
      ],
      "goalAnalysis": [
        {"goalName": string, "projectedAchievementDate": string, "isReached": boolean}
      ],
      "insight": "A professional analysis of how these changes impact the user's long-term wealth (3-4 sentences).",
      "recommendation": "One key strategic move the user should make based on this simulation."
    }

    Rules:
    - Return ONLY the JSON object.
    - All monetary values must be in ${userCurrency}.
    - Be realistic but encouraging.
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
    .insert([
      {
        user_id: user.id,
        month,
        insight_data: insightData,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving AI insight:", error);
    return { error: error.message };
  }

  return { success: true, data };
}

export async function getSavedInsights(month?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("ai_insights")
    .select("*")
    .order("created_at", { ascending: false });

  if (month) {
    query = query.eq("month", month);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching AI insights:", error);
    return [];
  }

  return data || [];
}

export async function deleteFinancialInsight(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ai_insights")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting AI insight:", error);
    return { error: error.message };
  }

  return { success: true };
}
