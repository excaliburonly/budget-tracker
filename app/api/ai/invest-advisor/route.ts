import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // 2. Check Premium Tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, currency")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== 'premium') {
    return new Response(JSON.stringify({ error: "PREMIUM_REQUIRED" }), { status: 403 });
  }

  const { messages } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response("API key missing", { status: 500 });

  // 3. Gather Context
  const [accounts, investments, sips, goals] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user.id),
    supabase.from("investments").select("*").eq("user_id", user.id),
    supabase.from("sips").select("*").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id)
  ]);

  const portfolioContext = {
    currency: profile.currency || 'INR',
    accounts: accounts.data,
    investments: investments.data,
    sips: sips.data,
    goals: goals.data
  };

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-2.0-flash for speed and streaming capability
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemInstructions = `
You are an expert Investment Advisor AI for the "Ledgr" financial app.
Your goal is to help users understand their investments and provide strategic advice based on their actual portfolio data.

USER PORTFOLIO CONTEXT:
${JSON.stringify(portfolioContext, null, 2)}

INSTRUCTIONS:
- Use the user's data to provide personalized advice.
- Be professional, data-driven, and clear.
- Provide specific suggestions based on their goals and asset distribution.
- MANDATORY: You MUST end every single response with the following disclaimer exactly:
  "***DISCLAIMER: Investing involves risk. Past performance is not indicative of future results. Always conduct your own research or consult with a qualified financial advisor before making any investment decisions. Invest at your own risk.***"

Tone: Professional, helpful, and direct.`;

  const chatHistory = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const lastMessage = chatHistory.pop();

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemInstructions }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to provide investment advice based on the user's portfolio. I will always include the mandatory risk disclaimer at the end of my responses." }],
      },
      ...chatHistory
    ],
  });

  try {
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
