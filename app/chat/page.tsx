"use client";

import { useState } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I have your rulebook loaded. Ask me any rule question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"casual" | "detailed">("casual");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, mode }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* 1. This container fills the exact remaining screen space below the navbar.
      2. 'overflow-hidden' prevents the entire web page from scrolling.
    */
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Chat History: 
        'flex-1' forces it to take up all available vertical space.
        'overflow-y-auto' makes ONLY this section scroll when text overflows.
      */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md
              ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-950 border border-slate-800 text-slate-200"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl px-4 py-3 text-sm animate-pulse">
              Consulting the rulebook...
            </div>
          </div>
        )}
      </div>

      {/* Sticky Control Footer:
        This remains pinned permanently to the bottom of the viewport wrapper.
      */}
      <footer className="border-t border-slate-800 bg-slate-950 p-4 shrink-0">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Mode Toggle Buttons & Info Button */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("casual")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  mode === "casual"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Casual Summary
              </button>
              <button
                type="button"
                onClick={() => setMode("detailed")}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  mode === "detailed"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Detailed Breakdown
              </button>
            </div>

            {/* Interactive Info Button / Tooltip */}
            <div className="group relative inline-block">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-xs font-serif text-slate-400 hover:border-slate-500 hover:text-white transition"
              >
                i
              </button>

              <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-72 origin-bottom-left scale-95 rounded-xl border border-slate-800 bg-slate-950 p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 z-50">
                <h4 className="text-sm font-semibold text-white mb-2">
                  Response Modes
                </h4>
                <div className="space-y-2 text-xs leading-relaxed text-slate-400">
                  <p>
                    <strong className="text-emerald-400">
                      Casual Summary:
                    </strong>{" "}
                    Perfect for a quick answer. Explains the rule in 2-3 simple
                    sentences using plain language. Great for players and fans.
                  </p>
                  <p>
                    <strong className="text-emerald-400">
                      Detailed Breakdown:
                    </strong>{" "}
                    A deep-dive analysis meant for serious referees. Includes
                    formal terminology, clause references, and practical match
                    scenarios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "casual"
                  ? "Ask a quick rule question..."
                  : "Ask for a deep dive scenario analysis..."
              }
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Ask
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
