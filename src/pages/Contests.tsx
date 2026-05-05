import Icon from "@/components/ui/icon";
import { useCms, g, gj } from "@/hooks/useCms";

interface ContestItem { id: number; status: string; title: string; description: string; deadline: string; prize: string; }

const FALLBACK: ContestItem[] = [
  { id: 1, status: "active", title: "«Весенний голос»", description: "Запишите кавер и пришлите нам.", deadline: "До 15 мая", prize: "10 000 ₽" },
  { id: 2, status: "active", title: "Угадай мелодию", description: "Каждый день в 12:00 в эфире звучит фрагмент.", deadline: "Ежедневно", prize: "Мерч радио" },
  { id: 3, status: "soon", title: "«Лето в эфире»", description: "Расскажи историю своего лета.", deadline: "Старт 1 июня", prize: "Билеты на фестиваль" },
  { id: 4, status: "ended", title: "Апрельский розыгрыш", description: "Победители определены.", deadline: "Завершён", prize: "2 билета" },
];

const statusLabel: Record<string, { label: string; color: string }> = {
  active: { label: "Идёт", color: "var(--radio-red)" },
  soon: { label: "Скоро", color: "var(--radio-amber)" },
  ended: { label: "Завершён", color: "var(--radio-muted)" },
};

export default function Contests() {
  const { data } = useCms("contests");
  const contests = gj<ContestItem>(data, "items", "list", FALLBACK);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Trophy" size={16} style={{ color: "var(--radio-red)" }} />
          <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>Конкурсы</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase" style={{ color: "var(--radio-text)" }}>
          {g(data, "header", "title", "Выигрывай вместе с нами")}
        </h1>
        {g(data, "header", "subtitle") && (
          <p className="mt-2 text-sm" style={{ color: "var(--radio-muted)" }}>{g(data, "header", "subtitle")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contests.map((c) => {
          const s = statusLabel[c.status] || statusLabel.active;
          return (
            <div
              key={c.id}
              className={`p-6 rounded-xl border card-hover${c.status === "ended" ? " opacity-60" : ""}`}
              style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display tracking-wide uppercase px-2 py-0.5 rounded" style={{ background: "rgba(232,68,26,0.10)", color: s.color }}>
                  {s.label}
                </span>
                <span className="text-xs" style={{ color: "var(--radio-muted)" }}>{c.deadline}</span>
              </div>
              <h2 className="font-display text-2xl uppercase mb-2" style={{ color: "var(--radio-text)" }}>{c.title}</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--radio-muted)" }}>{c.description}</p>
              <div className="flex items-center gap-2">
                <Icon name="Gift" size={14} style={{ color: "var(--radio-red)" }} />
                <span className="text-sm font-display tracking-wide" style={{ color: "var(--radio-text)" }}>Приз: {c.prize}</span>
              </div>
              {c.status !== "ended" && (
                <button className="mt-4 w-full py-2.5 rounded-lg font-display tracking-wide uppercase text-sm transition-all hover:opacity-90" style={{ background: "var(--radio-red)", color: "#fff" }}>
                  Участвовать
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
