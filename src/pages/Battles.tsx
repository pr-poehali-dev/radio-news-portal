import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/3a7aceb9-cf34-4ef5-b28a-c9f21180f1b6";

interface Battle {
  id: number;
  title: string;
  artist1: string;
  artist2: string;
  votes1: number;
  votes2: number;
  is_active: boolean;
}

export default function Battles() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Record<number, 1 | 2>>({});
  const [voting, setVoting] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("battle_votes");
    if (stored) setVoted(JSON.parse(stored));
    fetchBattles();
  }, []);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setBattles(data.battles || []);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (battleId: number, choice: 1 | 2) => {
    if (voted[battleId] || voting === battleId) return;
    setVoting(battleId);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", battle_id: battleId, choice }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      const newVoted = { ...voted, [battleId]: choice };
      setVoted(newVoted);
      localStorage.setItem("battle_votes", JSON.stringify(newVoted));
      setBattles((prev) =>
        prev.map((b) =>
          b.id === battleId ? { ...b, votes1: data.votes1, votes2: data.votes2 } : b
        )
      );
    } finally {
      setVoting(null);
    }
  };

  const activeBattles = battles.filter((b) => b.is_active);
  const endedBattles = battles.filter((b) => !b.is_active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Swords" size={16} style={{ color: "var(--radio-red)" }} />
          <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>
            Батлы
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase" style={{ color: "var(--radio-text)" }}>
          Кто круче?
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--radio-muted)" }}>
          Голосуйте за любимого исполнителя — 1 голос на каждый батл
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--radio-red)", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <>
          {/* Active battles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {activeBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                battle={battle}
                myVote={voted[battle.id]}
                loading={voting === battle.id}
                onVote={(choice) => vote(battle.id, choice)}
              />
            ))}
          </div>

          {/* Ended battles */}
          {endedBattles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="CheckCircle" size={14} style={{ color: "var(--radio-muted)" }} />
                <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-muted)" }}>
                  Завершённые батлы
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
                {endedBattles.map((battle) => (
                  <BattleCard
                    key={battle.id}
                    battle={battle}
                    myVote={voted[battle.id]}
                    loading={false}
                    onVote={() => {}}
                    ended
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BattleCard({
  battle,
  myVote,
  loading,
  onVote,
  ended = false,
}: {
  battle: Battle;
  myVote?: 1 | 2;
  loading: boolean;
  onVote: (choice: 1 | 2) => void;
  ended?: boolean;
}) {
  const hasVoted = myVote !== undefined;
  const total = battle.votes1 + battle.votes2;
  const pct1 = total > 0 ? Math.round((battle.votes1 / total) * 100) : 50;
  const pct2 = 100 - pct1;
  const winner = hasVoted || ended ? (battle.votes1 >= battle.votes2 ? 1 : 2) : null;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}
    >
      {/* Title */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-muted)" }}>
          {battle.title}
        </span>
        {ended && (
          <span className="text-xs font-display tracking-wide uppercase px-2 py-0.5 rounded" style={{ background: "rgba(122,111,99,0.15)", color: "var(--radio-muted)" }}>
            Завершён
          </span>
        )}
        {!ended && !hasVoted && (
          <span className="live-dot" />
        )}
      </div>

      {/* Artists */}
      <div className="grid grid-cols-2 gap-0">
        {/* Artist 1 */}
        <button
          onClick={() => !hasVoted && !ended && onVote(1)}
          disabled={hasVoted || ended || loading}
          className="relative flex flex-col items-center justify-center gap-2 py-6 px-4 transition-all group"
          style={{
            background: myVote === 1 ? "rgba(232,68,26,0.12)" : "transparent",
            cursor: hasVoted || ended ? "default" : "pointer",
          }}
        >
          {winner === 1 && hasVoted && (
            <Icon name="Crown" size={14} className="absolute top-3 right-3" style={{ color: "var(--radio-amber)" }} />
          )}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-display"
            style={{
              background: myVote === 1 ? "var(--radio-red)" : "var(--radio-surface2)",
              color: myVote === 1 ? "#fff" : "var(--radio-text)",
              transition: "all 0.2s",
            }}
          >
            {battle.artist1.charAt(0).toUpperCase()}
          </div>
          <span
            className="font-display text-sm uppercase text-center leading-tight"
            style={{ color: myVote === 1 ? "var(--radio-text)" : "var(--radio-muted)" }}
          >
            {battle.artist1}
          </span>
          {!hasVoted && !ended && (
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--radio-red)" }}>
              Голосовать
            </span>
          )}
          {(hasVoted || ended) && (
            <span className="font-display text-xl" style={{ color: myVote === 1 ? "var(--radio-red)" : "var(--radio-muted)" }}>
              {pct1}%
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="absolute inset-y-0" style={{ left: "50%", width: 1 }} />

        {/* VS */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display text-xs"
            style={{ background: "var(--radio-dark)", color: "var(--radio-red)", border: "1px solid var(--radio-surface2)" }}
          >
            VS
          </div>
        </div>

        {/* Artist 2 */}
        <button
          onClick={() => !hasVoted && !ended && onVote(2)}
          disabled={hasVoted || ended || loading}
          className="relative flex flex-col items-center justify-center gap-2 py-6 px-4 transition-all group border-l"
          style={{
            background: myVote === 2 ? "rgba(232,68,26,0.12)" : "transparent",
            borderColor: "var(--radio-surface2)",
            cursor: hasVoted || ended ? "default" : "pointer",
          }}
        >
          {winner === 2 && hasVoted && (
            <Icon name="Crown" size={14} className="absolute top-3 left-3" style={{ color: "var(--radio-amber)" }} />
          )}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-display"
            style={{
              background: myVote === 2 ? "var(--radio-red)" : "var(--radio-surface2)",
              color: myVote === 2 ? "#fff" : "var(--radio-text)",
              transition: "all 0.2s",
            }}
          >
            {battle.artist2.charAt(0).toUpperCase()}
          </div>
          <span
            className="font-display text-sm uppercase text-center leading-tight"
            style={{ color: myVote === 2 ? "var(--radio-text)" : "var(--radio-muted)" }}
          >
            {battle.artist2}
          </span>
          {!hasVoted && !ended && (
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--radio-red)" }}>
              Голосовать
            </span>
          )}
          {(hasVoted || ended) && (
            <span className="font-display text-xl" style={{ color: myVote === 2 ? "var(--radio-red)" : "var(--radio-muted)" }}>
              {pct2}%
            </span>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {(hasVoted || ended) && (
        <div className="flex h-1">
          <div style={{ width: `${pct1}%`, background: myVote === 1 ? "var(--radio-red)" : "var(--radio-surface2)", transition: "width 0.5s" }} />
          <div style={{ flex: 1, background: myVote === 2 ? "var(--radio-red)" : "var(--radio-surface2)", transition: "width 0.5s" }} />
        </div>
      )}

      {/* Total votes */}
      {(hasVoted || ended) && (
        <div className="px-5 py-2 text-xs text-right" style={{ color: "var(--radio-muted)" }}>
          Всего голосов: {total}
        </div>
      )}
    </div>
  );
}
