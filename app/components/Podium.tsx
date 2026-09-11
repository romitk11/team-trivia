import type { Player } from "@/lib/types";

const PLACES = [
  { rank: 2, height: "h-28", medal: "🥈", order: "order-1" },
  { rank: 1, height: "h-36", medal: "🥇", order: "order-2" },
  { rank: 3, height: "h-20", medal: "🥉", order: "order-3" },
];

export default function Podium({ players }: { players: Player[] }) {
  const top3 = players.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="mb-6 flex items-end justify-center gap-3">
      {PLACES.filter((p) => top3[p.rank - 1]).map(({ rank, height, medal, order }) => {
        const player = top3[rank - 1];
        return (
          <div
            key={rank}
            className={`animate-pop-in flex w-24 flex-col items-center ${order}`}
            style={{ animationDelay: `${rank * 150}ms` }}
          >
            <span className="mb-1 text-3xl drop-shadow-lg">{medal}</span>
            <span className="text-2xl">{player.avatar}</span>
            <span className="mb-2 max-w-full truncate font-display text-sm font-bold text-white">
              {player.name}
            </span>
            <div
              className={`flex ${height} w-full flex-col items-center justify-start rounded-t-xl bg-gradient-to-b from-brand-blue to-brand-blue-hover pt-2 shadow-lg`}
            >
              <span className="font-display text-lg font-bold text-white">{player.score}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
