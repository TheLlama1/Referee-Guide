"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        router.refresh();
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.refresh();
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950 p-10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">
            {isSignUp ? "Join RefZone" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Master the laws of the game with AI.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex rounded-xl bg-slate-900 p-1">
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${!isSignUp ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${isSignUp ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-4 text-sm font-black text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
