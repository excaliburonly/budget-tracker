"use client";

import { useState, useRef, useEffect } from "react";
import { SparklesIcon, PaperAirplaneIcon, UserIcon, ComputerDesktopIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useDashboard } from "@/providers/dashboard-provider";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIInvestmentAdvisor() {
    const { profile } = useDashboard();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPremium = profile?.subscription_tier === 'premium';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !isPremium) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Add an empty assistant message to fill in
        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

        try {
            const response = await fetch("/api/ai/invest-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.error === "PREMIUM_REQUIRED") {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = "The AI Investment Advisor is a premium feature. Please upgrade your account to access personalized investment guidance.";
                        return newMessages;
                    });
                    return;
                }
                throw new Error("Failed to fetch");
            }

            const reader = response.body?.getReader();
            const textDecoder = new TextDecoder();

            if (!reader) throw new Error("No reader");

            let accumulatedText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = textDecoder.decode(value);
                accumulatedText += chunk;

                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = accumulatedText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = "Sorry, I encountered an error. Please try again later.";
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface/40 rounded-[2.5rem] border-2 border-dashed border-surface-border/50">
                <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mb-6">
                    <LockClosedIcon className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">Premium Feature</h3>
                <p className="text-text-muted max-w-md font-medium">
                    The AI Investment Advisor uses advanced Gemini models to analyze your portfolio and provide personalized strategic advice.
                </p>
                <button className="mt-8 px-8 py-3 bg-amber-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-600/20 hover:scale-105 transition-all">
                    Upgrade to Premium
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[700px] bg-surface/80 backdrop-blur-sm rounded-[2.5rem] border border-surface-border/50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-surface-border/50 flex items-center gap-4 bg-primary/5">
                <div className="p-2.5 bg-primary/20 rounded-xl">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">AI Investment Advisor</h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Powered by Gemini • Personalized Strategy</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-surface-border">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-foreground">Welcome to your AI Advisor</p>
                            <p className="text-sm text-text-muted max-w-xs">Ask me anything about your portfolio, SIPs, or investment strategies.</p>
                        </div>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                            message.role === 'user' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-primary/10 text-primary'
                        }`}>
                            {message.role === 'user' ? <UserIcon className="w-6 h-6" /> : <ComputerDesktopIcon className="w-6 h-6" />}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                message.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                                    : 'bg-background/80 border border-surface-border/50 text-foreground rounded-tl-none font-medium shadow-sm'
                            }`}>
                                {message.content}
                                {message.role === 'assistant' && isLoading && index === messages.length - 1 && !message.content && (
                                    <div className="flex gap-1 py-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-6 border-t border-surface-border/50 bg-background/30">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., How can I reach my 'Home Purchase' goal faster?"
                        className="w-full pl-6 pr-14 py-4 rounded-2xl border border-surface-border/50 bg-background/50 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold placeholder:text-text-muted/40"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                    </button>
                </div>
                <p className="text-[10px] text-text-muted mt-3 text-center font-bold uppercase tracking-widest">
                    AI can make mistakes. Consider consulting a professional advisor.
                </p>
            </form>
        </div>
    );
}
