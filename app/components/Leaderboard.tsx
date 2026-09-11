import type { Player } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

function RankChange({ previousRank, currentRank }: { previousRank?: number; currentRank: number }) {
  if (previousRank === undefined || previousRank === currentRank) return <span className="w-4" />;
  const movedUp = currentRank < previousRank;
  return (
    <span
      className={`w-4 text-center text-xs font-bold ${movedUp ? "text-answer-green" : "text-answer-red"}`}
      title={movedUp ? "Moved up" : "Moved down"}
    >
      {movedUp ? "▲" : "▼"}
    </span>
  );
}

export default function Leaderboard({
  players,
  currentPlayerId,
  title = "Leaderboard",
  previousRanks,
}: {
  players: Player[]; // must already be sorted by score desc
  currentPlayerId?: string;
  title?: string;
  previousRanks?: Record<string, number>;
}) {
  const top5 = players.slice(0, 5);
  const ownIndex = currentPlayerId ? players.findIndex((p) => p.id === currentPlayerId) : -1;
  const ownOutsideTop5 = ownIndex >= 5 ? players[ownIndex] : null;

  return (
    <div className="card-glow w-full rounded-2xl bg-white/95 p-4 backdrop-blur">
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-brand-blue-dark">
        {title}
      </h3>
      <ol className="space-y-2">
        {top5.map((p, i) => (
          <li
            key={p.id}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`animate-fade-in-up flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
              p.id === currentPlayerId
                ? "bg-brand-blue-light font-bold ring-1 ring-brand-blue/30"
                : i === 0
                  ? "bg-gradient-to-r from-amber-50 to-marble"
                  : "bg-marble"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <RankChange previousRank={previousRanks?.[p.id]} currentRank={i} />
              <span className="w-6 text-center text-lg leading-none">
                {MEDALS[i] ?? <span className="text-sm font-bold text-ink/40">{i + 1}</span>}
              </span>
              <span className="text-xl">{p.avatar}</span>
              <span className="text-ink">{p.name}</span>
            </span>
            <span className="font-display text-ink">{p.score}</span>
          </li>
        ))}
        {top5.length === 0 && <li className="text-ink/60">No players yet.</li>}
      </ol>
      {ownOutsideTop5 && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-blue-light px-3 py-2.5 font-bold ring-1 ring-brand-blue/30">
          <span className="flex items-center gap-2 text-ink">
            <RankChange previousRank={previousRanks?.[ownOutsideTop5.id]} currentRank={ownIndex} />
            <span className="w-6 text-center text-sm text-ink/50">{ownIndex + 1}</span>
            <span className="text-xl">{ownOutsideTop5.avatar}</span>
            {ownOutsideTop5.name} (you)
          </span>
          <span className="font-display text-ink">{ownOutsideTop5.score}</span>
        </div>
      )}
    </div>
  );
}
