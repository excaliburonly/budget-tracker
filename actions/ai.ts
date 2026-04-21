"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateFinancialInsights() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!process.env.GEMINI_API_KEY) {
    return { 
      error: "GEMINI_API_KEY is not configured. Please add it to your environment variables." 
    };
  }

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
    currentDate: now.toISOString().split('T')[0]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { 
      responseMimeType: "application/json" 
    }
  });

  const prompt = `
    You are a professional financial advisor assistant for "Ledgr", a personal finance app. 
    Analyze the following financial data for the user for the month of ${monthString}.
    
    Current Date: ${context.currentDate}

    Data:
    ${JSON.stringify(context, null, 2)}

    Provide a concise, helpful, and professional analysis in JSON format with the following structure:
    {
      "recap": "A 2-3 sentence summary of the overall spending and income performance this month.",
      "anomalies": ["A list of 1-3 unusual spending patterns, spikes, or large transactions. If none, return an empty array."],
      "optimizations": ["2-3 actionable suggestions on where to save money or reallocate budget based on spending vs budgets."]
    }

    Rules:
    - Keep the tone encouraging and professional.
    - If there is very little data, provide a summary of what is there and general financial advice.
    - Focus on categories where spending is high.
    - Compare spending to budgets where applicable.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return { 
      error: "Failed to generate insights. Please try again later." 
    };
  }
}
