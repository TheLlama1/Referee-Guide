"use client";

export default function LawsPage() {
  const pdfPath = "/files/lawsofthegame2025.pdf";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              IFAB Official Rulebook
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Laws of the Game 2025/26
            </h1>
            <p className="text-sm text-slate-400">
              Official FIFA / IFAB regulations, interpretations, and guidelines
              for match officials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition"
            >
              Open Fullscreen ↗
            </a>
            <a
              href={pdfPath}
              download="IFAB_Laws_of_the_Game_2025_26.pdf"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition"
            >
              Download PDF
            </a>
          </div>
        </div>

        {/* Framed Document Viewer Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4 shadow-2xl">
          {/* Subtle Top Document Bar */}
          <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-800/80 mb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-300">
                lawsofthegame2025.pdf
              </span>
            </div>
            <span className="hidden sm:inline text-slate-500">
              Tip: Press{" "}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300">
                Ctrl + F
              </kbd>{" "}
              inside the document to search specific laws
            </span>
          </div>

          {/* Constrained PDF Frame */}
          <div className="w-full h-[78vh] min-h-[600px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60">
            <iframe
              src={`/files/lawsofthegame.pdf#view=FitH`}
              title="IFAB Laws of the Game 2025/26"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
