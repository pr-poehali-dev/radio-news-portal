import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function Requests() {
  const [form, setForm] = useState({ name: "", song: "", artist: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const recentRequests = [
    { name: "Алина", song: "Дорогой длинною", artist: "Нюша" },
    { name: "Дмитрий", song: "Молодые ветра", artist: "Ария" },
    { name: "Марина", song: "Сердце", artist: "Земфира" },
    { name: "Сергей", song: "Выйду ночью в поле с конём", artist: "Любэ" },
    { name: "Ольга", song: "Руки вверх", artist: "Руки Вверх!" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Music" size={16} style={{ color: "var(--radio-red)" }} />
          <span
            className="text-xs font-display tracking-widest uppercase"
            style={{ color: "var(--radio-red)" }}
          >
            Заказ песни
          </span>
        </div>
        <h1
          className="font-display text-4xl md:text-5xl uppercase"
          style={{ color: "var(--radio-text)" }}
        >
          Закажи свою песню
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div
          className="p-6 rounded-xl border"
          style={{
            background: "var(--radio-surface)",
            borderColor: "var(--radio-surface2)",
          }}
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(232,68,26,0.15)" }}
              >
                <Icon name="Check" size={28} style={{ color: "var(--radio-red)" }} />
              </div>
              <h2
                className="font-display text-2xl uppercase"
                style={{ color: "var(--radio-text)" }}
              >
                Заявка отправлена!
              </h2>
              <p style={{ color: "var(--radio-muted)" }} className="text-sm">
                Ведущий постарается включить вашу песню в ближайший эфир.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", song: "", artist: "", message: "" }); }}
                className="mt-2 px-5 py-2 rounded-lg font-display tracking-wide uppercase text-sm"
                style={{ background: "var(--radio-surface2)", color: "var(--radio-text)" }}
              >
                Ещё заявка
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                  Ваше имя
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Как вас представить в эфире"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
                  style={{
                    background: "var(--radio-surface2)",
                    border: "1px solid var(--radio-surface2)",
                    color: "var(--radio-text)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                  Название песни
                </label>
                <input
                  required
                  value={form.song}
                  onChange={(e) => setForm({ ...form, song: e.target.value })}
                  placeholder="Название трека"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
                  style={{
                    background: "var(--radio-surface2)",
                    border: "1px solid var(--radio-surface2)",
                    color: "var(--radio-text)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                  Исполнитель
                </label>
                <input
                  required
                  value={form.artist}
                  onChange={(e) => setForm({ ...form, artist: e.target.value })}
                  placeholder="Имя артиста или группы"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1"
                  style={{
                    background: "var(--radio-surface2)",
                    border: "1px solid var(--radio-surface2)",
                    color: "var(--radio-text)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                  Пожелание (необязательно)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Посвящение или пожелание ведущему"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 resize-none"
                  style={{
                    background: "var(--radio-surface2)",
                    border: "1px solid var(--radio-surface2)",
                    color: "var(--radio-text)",
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-display tracking-wide uppercase text-sm transition-all hover:opacity-90"
                style={{ background: "var(--radio-red)", color: "#fff" }}
              >
                Отправить заявку
              </button>
            </form>
          )}
        </div>

        {/* Recent requests */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="ListMusic" size={16} style={{ color: "var(--radio-red)" }} />
            <h2
              className="font-display text-sm tracking-widest uppercase"
              style={{ color: "var(--radio-text)" }}
            >
              Последние заявки
            </h2>
          </div>
          <div className="space-y-2">
            {recentRequests.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-3 rounded-lg"
                style={{ background: "var(--radio-surface)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(232,68,26,0.12)" }}
                >
                  <Icon name="Music2" size={14} style={{ color: "var(--radio-red)" }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm truncate" style={{ color: "var(--radio-text)" }}>
                    {r.song} — {r.artist}
                  </div>
                  <div className="text-xs" style={{ color: "var(--radio-muted)" }}>
                    от {r.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
