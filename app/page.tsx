import Link from "next/link";

export default function Home() {
  return (
    <div className="stage flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="animate-float-slow mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-blue to-answer-green text-4xl shadow-2xl"
        aria-hidden="true"
      >
        🧠
      </div>
      <h1 className="animate-fade-in-up font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
        Team Trivia
      </h1>
      <p className="animate-fade-in-up mt-4 max-w-md text-lg text-surface" style={{ animationDelay: "80ms" }}>
        Live trivia for the team. Join with a code, answer fast, climb the leaderboard.
      </p>

      <div
        className="animate-fade-in-up mt-10 flex w-full max-w-sm flex-col gap-4"
        style={{ animationDelay: "160ms" }}
      >
        <Link
          href="/join"
          className="group relative overflow-hidden rounded-2xl bg-brand-blue px-6 py-4 text-lg font-bold text-white shadow-xl shadow-brand-blue/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand-blue/40 active:translate-y-0"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <span className="relative">Join a Game</span>
        </Link>
        <Link
          href="/host/login"
          className="rounded-2xl border-2 border-white/15 bg-white/5 px-6 py-4 text-lg font-bold text-white backdrop-blur transition-all duration-150 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 active:translate-y-0"
        >
          Host
        </Link>
      </div>
    </div>
  );
}
