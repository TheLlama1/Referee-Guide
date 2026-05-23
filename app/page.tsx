import Link from "next/link";

export default function HomePage() {
  const categories = [
    {
      title: "Law 11 - Offside",
      desc: "A deep dive into offside positioning, interfering with play, and deliberate saves vs. deliberate plays.",
      link: "https://www.theifab.com/laws/latest/offside/",
    },
    {
      title: "Law 12 - Fouls & Misconduct",
      desc: "Understanding the difference between careless, reckless, and using excessive force, plus handball updates.",
      link: "https://www.theifab.com/laws/latest/fouls-and-misconduct/",
    },
    {
      title: "Law 14 - The Penalty Kick",
      desc: "A review of goalkeeper encroachment lines, illegal kicker feinting, and simultaneous player violations.",
      link: "https://www.theifab.com/laws/latest/the-penalty-kick/",
    },
  ];
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          Master the Laws of the Game
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Your Ultimate{" "}
          <span className="text-emerald-400">Referee Resource</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Explore the official rules, study complex match scenarios, or test
          your knowledge instantly using our AI rule book assistant.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/chat"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Ask the AI Assistant
          </Link>
          <a
            href="#rules"
            className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Browse Rulebook
          </a>
        </div>
      </section>
      {/* Rules Grid */}
      <section
        id="rules"
        className="mx-auto max-w-5xl px-6 py-16 border-t border-slate-800"
      >
        {/* Added text-center here to center the breakdown text */}
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Key Rule Breakdowns
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-6 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-emerald-400">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div>
                {/* Changed hardcoded URL string to dynamic cat.link variable */}
                <Link
                  href={cat.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-white hover:underline"
                >
                  Read deep dive →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
