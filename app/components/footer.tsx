import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 text-slate-500">
      <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-300">
            RefZone Education
          </div>
          <p className="mt-1 text-xs max-w-md leading-relaxed text-slate-500">
            An unofficial rulebook companion designed to help referees, players,
            and coaches understand the game. Always consult official governing
            bodies for final match determinations.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <Link href="/" className="hover:text-slate-300 transition">
            Home
          </Link>
          <Link href="/chat" className="hover:text-slate-300 transition">
            AI Guide
          </Link>
          <a href="#" className="hover:text-slate-300 transition">
            Terms
          </a>
          <a href="#" className="hover:text-slate-300 transition">
            Privacy Policy
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 mt-8 pt-8 border-t border-slate-900/50 text-center text-xs">
        &copy; {new Date().getFullYear()} RefZone. All rights reserved.
      </div>
    </footer>
  );
}
