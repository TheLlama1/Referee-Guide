"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getAuthAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch via API to ensure cookies don't inflate
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.username) {
            setUsername(profile.username);
          }
        }
      } else {
        setUser(null);
        setUsername(null);
      }
    };
    getAuthAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetch("/api/profile")
          .then((res) => (res.ok ? res.json() : null))
          .then((profile) => setUsername(profile?.username || null));
      } else {
        setUser(null);
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
            Ref
            <span className="text-emerald-400 group-hover:text-white transition">
              Zone
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/quiz"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Practice Quiz
          </Link>
          <Link
            href="/files/lawsofthegame2025.pdf"
            download="lawsofthegame2025.pdf"
            className="text-sm font-medium text-slate-400 transition hover:text-white"
          >
            Laws of the game 2025/26
          </Link>
          <Link
            href="/chat"
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-400 shadow-sm transition hover:bg-emerald-500 hover:text-slate-950"
          >
            AI Assistant
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
              <Link
                href="/profile"
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer truncate max-w-[120px]"
              >
                {username || "My Profile"}
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-1.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-xl bg-emerald-500 px-5 py-1.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
