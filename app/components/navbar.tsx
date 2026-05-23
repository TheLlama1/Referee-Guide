import Link from "next/link";

export default function Navbar() {
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
        </nav>
      </div>
    </header>
  );
}
