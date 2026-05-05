import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useCms, g, gj } from "@/hooks/useCms";

interface PollItem { id: number; question: string; options: string[]; }

interface Poll {
  id: number;
  question: string;
  options: { id: number; label: string; votes: number }[];
}

const FALLBACK: PollItem[] = [
  { id: 1, question: "Какой формат утреннего эфира вам нравится больше?", options: ["Музыка без разговоров", "Ведущий + музыка", "Новости + музыка", "Интервью с гостями"] },
  { id: 2, question: "Какой жанр вы хотите слышать чаще?", options: ["Поп", "Рок", "Электронная музыка", "Классика"] },
  { id: 3, question: "В какое время слушаете радио чаще всего?", options: ["Утром (06:00–10:00)", "Днём (10:00–16:00)", "Вечером (16:00–22:00)", "Ночью"] },
];

function buildPolls(items: PollItem[]): Poll[] {
  return items.map((p) => ({
    id: p.id,
    question: p.question,
    options: p.options.map((label, i) => ({ id: i + 1, label, votes: Math.floor(Math.random() * 150 + 40) })),
  }));
}

export default function Votes() {
  const { data } = useCms("votes");
  const pollItems = gj<PollItem>(data, "polls", "list", FALLBACK);
  const [polls, setPolls] = useState<Poll[]>(() => buildPolls(FALLBACK));
  const [voted, setVoted] = useState<Record<number, number>>({});

  // Синхронизируем polls когда загрузился CMS
  useState(() => {
    if (pollItems.length) setPolls(buildPolls(pollItems));
  });

  const vote = (pollId: number, optionId: number) => {
    if (voted[pollId] !== undefined) return;
    setPolls((prev) =>
      prev.map((p) =>
        p.id === pollId
          ? { ...p, options: p.options.map((o) => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) }
          : p
      )
    );
    setVoted((prev) => ({ ...prev, [pollId]: optionId }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="BarChart2" size={16} style={{ color: "var(--radio-red)" }} />
          <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>Голосования</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase" style={{ color: "var(--radio-text)" }}>
          {g(data, "header", "title", "Ваше мнение важно")}
        </h1>
        {g(data, "header", "subtitle") && (
          <p className="mt-2 text-sm" style={{ color: "var(--radio-muted)" }}>{g(data, "header", "subtitle")}</p>
        )}
      </div>

      <div className="space-y-6">
        {polls.map((poll) => {
          const hasVoted = voted[poll.id] !== undefined;
          const total = poll.options.reduce((s, o) => s + o.votes, 0);
          return (
            <div key={poll.id} className="p-6 rounded-xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
              <h2 className="font-display text-xl uppercase mb-5" style={{ color: "var(--radio-text)" }}>{poll.question}</h2>
              <div className="space-y-3">
                {poll.options.map((opt) => {
                  const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                  const isChosen = voted[poll.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => vote(poll.id, opt.id)}
                      disabled={hasVoted}
                      className="w-full text-left relative overflow-hidden rounded-lg px-4 py-3 transition-all"
                      style={{ background: isChosen ? "rgba(232,68,26,0.15)" : "var(--radio-surface2)", border: `1px solid ${isChosen ? "var(--radio-red)" : "transparent"}`, cursor: hasVoted ? "default" : "pointer" }}
                    >
                      {hasVoted && (
                        <div className="absolute left-0 top-0 bottom-0 rounded-lg transition-all" style={{ width: `${pct}%`, background: isChosen ? "rgba(232,68,26,0.18)" : "rgba(255,255,255,0.04)" }} />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className="text-sm" style={{ color: isChosen ? "var(--radio-text)" : "var(--radio-muted)" }}>{opt.label}</span>
                        {hasVoted && <span className="text-xs font-display" style={{ color: isChosen ? "var(--radio-red)" : "var(--radio-muted)" }}>{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasVoted && <p className="text-xs mt-3" style={{ color: "var(--radio-muted)" }}>Всего голосов: {total}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
