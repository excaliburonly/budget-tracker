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

  const model = genAI.getGenerativeModel(
    { model: "gemini-flash-latest" },
    { apiVersion: "v1beta" }
  );

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
    - Return ONLY the JSON object.
    - Keep the tone encouraging and professional.
    - If there is very little data, provide a summary of what is there and general financial advice.
    - Focus on categories where spending is high.
    - Compare spending to budgets where applicable.
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
