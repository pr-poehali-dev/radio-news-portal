import Icon from "@/components/ui/icon";
import { useCms, g, gj } from "@/hooks/useCms";

interface NewsItem { id: number; date: string; category: string; title: string; text: string; }

const FALLBACK: NewsItem[] = [
  { id: 1, date: "26 апреля 2026", category: "Анонс", title: "Радио Генезия запускает новую волну летних хитов", text: "С 1 мая в эфире появится специальный летний блок." },
  { id: 2, date: "24 апреля 2026", category: "Конкурс", title: "Победители апрельского конкурса объявлены", text: "Поздравляем победителей." },
  { id: 3, date: "22 апреля 2026", category: "Новости", title: "Новый ведущий в утреннем эфире — уже в мае", text: "К команде Радио Генезия присоединяется Максим Орлов." },
  { id: 4, date: "18 апреля 2026", category: "Технологии", title: "Качество потока улучшено до 320 kbps", text: "Обновили серверную инфраструктуру." },
  { id: 5, date: "15 апреля 2026", category: "Анонс", title: "Ночная волна: новый формат по пятницам", text: "Каждую пятницу с 23:00 — специальный эфир." },
  { id: 6, date: "10 апреля 2026", category: "Интервью", title: "Эксклюзивное интервью с группой «Полночь»", text: "Артисты рассказали о новом альбоме." },
];

export default function News() {
  const { data } = useCms("news");
  const articles = gj<NewsItem>(data, "articles", "items", FALLBACK);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Newspaper" size={16} style={{ color: "var(--radio-red)" }} />
          <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>Новости</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl uppercase" style={{ color: "var(--radio-text)" }}>
          {g(data, "header", "title", "Последние события")}
        </h1>
        {g(data, "header", "subtitle") && (
          <p className="mt-2 text-sm" style={{ color: "var(--radio-muted)" }}>{g(data, "header", "subtitle")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((item, i) => (
          <article
            key={item.id}
            className={`p-6 rounded-xl border card-hover animate-fade-up`}
            style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)", animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-display tracking-wide uppercase px-2 py-0.5 rounded" style={{ background: "rgba(232,68,26,0.12)", color: "var(--radio-red)" }}>
                {item.category}
              </span>
              <span className="text-xs" style={{ color: "var(--radio-muted)" }}>{item.date}</span>
            </div>
            <h2 className="font-display text-lg uppercase leading-tight mb-2" style={{ color: "var(--radio-text)" }}>{item.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--radio-muted)" }}>{item.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
