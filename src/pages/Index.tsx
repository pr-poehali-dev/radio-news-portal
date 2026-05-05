import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useCms, g, gj } from "@/hooks/useCms";

interface ScheduleItem { time: string; title: string; host: string; }
interface NewsItem { id: number; date: string; title: string; category: string; }

const FALLBACK_SCHEDULE: ScheduleItem[] = [
  { time: "07:00", title: "Утренний эфир", host: "Максим Орлов" },
  { time: "10:00", title: "Музыкальный час", host: "Анна Светлова" },
  { time: "13:00", title: "Дневной блок", host: "Дмитрий Коваль" },
  { time: "16:00", title: "Горячие новинки", host: "Юлия Морева" },
  { time: "19:00", title: "Вечерний эфир", host: "Игорь Зайцев" },
  { time: "22:00", title: "Ночная волна", host: "Ксения Лунёва" },
];
const FALLBACK_NEWS: NewsItem[] = [
  { id: 1, date: "26 апреля", title: "Радио Генезия запускает новую волну летних хитов", category: "Анонс" },
  { id: 2, date: "24 апреля", title: "Победители апрельского конкурса объявлены", category: "Конкурс" },
  { id: 3, date: "22 апреля", title: "Новый ведущий в утреннем эфире — уже в мае", category: "Новости" },
];

export default function Index() {
  const { data } = useCms("index");
  const schedule = gj<ScheduleItem>(data, "schedule", "items", FALLBACK_SCHEDULE);
  const newsItems = gj<NewsItem>(
    data,
    "articles",
    "items",
    FALLBACK_NEWS
  ).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--radio-surface)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(232,68,26,0.08) 0%, transparent 70%)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="max-w-2xl animate-fade-up">
            <div className="flex items-center gap-2 mb-6">
              <span className="live-dot" />
              <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>
                Сейчас в эфире
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none mb-4" style={{ color: "var(--radio-text)" }}>
              {g(data, "hero", "title", "Радио").split(" ").map((word, i) => (
                <span key={i}>
                  {i === 1 ? <span style={{ color: "var(--radio-red)" }}>{word}</span> : word}
                  {i === 0 ? <br /> : ""}
                  {i > 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p className="text-lg mb-8 max-w-md" style={{ color: "var(--radio-muted)" }}>
              {g(data, "hero", "subtitle", "Музыка, которая создаёт начала.")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/requests"
                className="px-6 py-3 rounded-lg font-display tracking-wide uppercase text-sm transition-all hover:opacity-90"
                style={{ background: "var(--radio-red)", color: "#fff" }}
              >
                {g(data, "hero", "btn_request", "Заказать песню")}
              </Link>
              <Link
                to="/contests"
                className="px-6 py-3 rounded-lg font-display tracking-wide uppercase text-sm border transition-all hover:border-white/30"
                style={{ borderColor: "var(--radio-surface2)", color: "var(--radio-muted)" }}
              >
                {g(data, "hero", "btn_contests", "Конкурсы")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="Clock" size={16} style={{ color: "var(--radio-red)" }} />
            <h2 className="font-display text-sm tracking-widest uppercase" style={{ color: "var(--radio-text)" }}>
              {g(data, "schedule", "title", "Программа сегодня")}
            </h2>
          </div>
          <div className="space-y-1">
            {schedule.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg card-hover" style={{ background: "var(--radio-surface)" }}>
                <span className="font-display text-sm w-12 shrink-0" style={{ color: "var(--radio-red)" }}>{item.time}</span>
                <span className="font-body text-sm flex-1" style={{ color: "var(--radio-text)" }}>{item.title}</span>
                <span className="font-body text-xs hidden sm:block" style={{ color: "var(--radio-muted)" }}>{item.host}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest news */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Icon name="Newspaper" size={16} style={{ color: "var(--radio-red)" }} />
              <h2 className="font-display text-sm tracking-widest uppercase" style={{ color: "var(--radio-text)" }}>Новости</h2>
            </div>
            <Link to="/news" className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-muted)" }}>Все →</Link>
          </div>
          <div className="space-y-3">
            {newsItems.map((n) => (
              <Link key={n.id} to="/news" className="block p-4 rounded-lg card-hover" style={{ background: "var(--radio-surface)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-display tracking-wide uppercase" style={{ color: "var(--radio-red)" }}>{n.category}</span>
                  <span className="text-xs" style={{ color: "var(--radio-muted)" }}>{n.date}</span>
                </div>
                <p className="text-sm leading-snug" style={{ color: "var(--radio-text)" }}>{n.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: "/contests", icon: "Trophy", label: "Конкурсы" },
            { to: "/battles", icon: "Swords", label: "Батлы" },
            { to: "/requests", icon: "Music", label: "Заказ песни" },
            { to: "/about", icon: "Radio", label: "О радио" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center gap-3 px-5 py-4 rounded-xl card-hover border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
              <Icon name={item.icon} size={20} style={{ color: "var(--radio-red)" }} />
              <span className="font-display text-sm tracking-wide uppercase" style={{ color: "var(--radio-text)" }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
