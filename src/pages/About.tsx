import Icon from "@/components/ui/icon";
import { useCms, g, gj } from "@/hooks/useCms";

interface StatItem { value: string; label: string; }
interface TeamItem { name: string; role: string; time: string; }
interface PlatformItem { name: string; url: string; }

const FALLBACK_STATS: StatItem[] = [
  { value: "128k", label: "слушателей в день" },
  { value: "24/7", label: "живой эфир" },
  { value: "15+", label: "лет в эфире" },
  { value: "320", label: "kbps качество" },
];
const FALLBACK_TEAM: TeamItem[] = [
  { name: "Максим Орлов", role: "Утренний ведущий", time: "07:00–10:00" },
  { name: "Анна Светлова", role: "Музыкальный редактор", time: "10:00–13:00" },
  { name: "Дмитрий Коваль", role: "Дневной ведущий", time: "13:00–16:00" },
  { name: "Юлия Морева", role: "Ведущая хит-парадов", time: "16:00–19:00" },
  { name: "Игорь Зайцев", role: "Вечерний ведущий", time: "19:00–22:00" },
  { name: "Ксения Лунёва", role: "Ночной эфир", time: "22:00–02:00" },
];
const FALLBACK_PLATFORMS: PlatformItem[] = [
  { name: "Прямо на сайте — онлайн-плеер", url: "#" },
  { name: "Apple Podcasts", url: "#" },
  { name: "Яндекс Музыка", url: "#" },
  { name: "SoundCloud", url: "#" },
  { name: "TuneIn Radio", url: "#" },
];

export default function About() {
  const { data } = useCms("about");
  const stats = gj<StatItem>(data, "stats", "items", FALLBACK_STATS);
  const team = gj<TeamItem>(data, "team", "items", FALLBACK_TEAM);
  const platforms = gj<PlatformItem>(data, "platforms", "items", FALLBACK_PLATFORMS);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--radio-surface)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 30% 50%, rgba(232,68,26,0.07) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="max-w-2xl animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Radio" size={16} style={{ color: "var(--radio-red)" }} />
              <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>О радио</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase leading-tight mb-4" style={{ color: "var(--radio-text)" }}>
              {g(data, "hero", "title", "Генезия —\nначало истории").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--radio-muted)" }}>
              {g(data, "hero", "subtitle", "Радио Генезия — это живое радио, которое звучит 24 часа в сутки.")}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6 rounded-xl border text-center" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
              <div className="font-display text-4xl mb-1" style={{ color: "var(--radio-red)" }}>{s.value}</div>
              <div className="text-sm" style={{ color: "var(--radio-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission + Platforms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
            <Icon name="Zap" size={24} style={{ color: "var(--radio-red)" }} className="mb-4" />
            <h2 className="font-display text-2xl uppercase mb-3" style={{ color: "var(--radio-text)" }}>Наша миссия</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--radio-muted)" }}>
              {g(data, "mission", "text", "Мы верим, что радио — это живое общение. Каждый эфир строится на настоящих историях, реальных людях и честной музыке.")}
            </p>
          </div>
          <div className="p-8 rounded-xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
            <Icon name="Headphones" size={24} style={{ color: "var(--radio-red)" }} className="mb-4" />
            <h2 className="font-display text-2xl uppercase mb-3" style={{ color: "var(--radio-text)" }}>Где слушать</h2>
            <div className="space-y-2">
              {platforms.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <Icon name="ChevronRight" size={14} style={{ color: "var(--radio-red)" }} />
                  <span className="text-sm" style={{ color: "var(--radio-muted)" }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Icon name="Users" size={16} style={{ color: "var(--radio-red)" }} />
          <h2 className="font-display text-sm tracking-widest uppercase" style={{ color: "var(--radio-text)" }}>Команда эфира</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.map((m) => (
            <div key={m.name} className="flex items-center gap-4 px-5 py-4 rounded-xl card-hover border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(232,68,26,0.12)" }}>
                <Icon name="Mic2" size={18} style={{ color: "var(--radio-red)" }} />
              </div>
              <div>
                <div className="font-display text-sm uppercase" style={{ color: "var(--radio-text)" }}>{m.name}</div>
                <div className="text-xs" style={{ color: "var(--radio-muted)" }}>{m.role} · {m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
