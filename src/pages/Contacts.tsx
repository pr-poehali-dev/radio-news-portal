import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function Contacts() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const contacts = [
    { icon: "Phone", label: "Телефон", value: "+7 (495) 000-00-00" },
    { icon: "Mail", label: "Email", value: "info@radiogenesiya.ru" },
    { icon: "MapPin", label: "Адрес", value: "Москва, ул. Радиоволны, 1" },
    { icon: "Clock", label: "Режим работы", value: "Пн–Пт 09:00–21:00" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="MessageSquare" size={16} style={{ color: "var(--radio-red)" }} />
          <span
            className="text-xs font-display tracking-widest uppercase"
            style={{ color: "var(--radio-red)" }}
          >
            Контакты
          </span>
        </div>
        <h1
          className="font-display text-4xl md:text-5xl uppercase"
          style={{ color: "var(--radio-text)" }}
        >
          Свяжитесь с нами
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact info */}
        <div>
          <div className="space-y-3 mb-8">
            {contacts.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-4 px-5 py-4 rounded-xl border"
                style={{
                  background: "var(--radio-surface)",
                  borderColor: "var(--radio-surface2)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(232,68,26,0.12)" }}
                >
                  <Icon name={c.icon} size={18} style={{ color: "var(--radio-red)" }} />
                </div>
                <div>
                  <div className="text-xs font-display tracking-wide uppercase mb-0.5" style={{ color: "var(--radio-muted)" }}>
                    {c.label}
                  </div>
                  <div className="text-sm" style={{ color: "var(--radio-text)" }}>
                    {c.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="p-5 rounded-xl border"
            style={{
              background: "var(--radio-surface)",
              borderColor: "var(--radio-surface2)",
            }}
          >
            <h3 className="font-display text-sm tracking-widest uppercase mb-4" style={{ color: "var(--radio-text)" }}>
              Мы в соцсетях
            </h3>
            <div className="flex gap-3">
              {[
                { icon: "Send", label: "Telegram" },
                { icon: "Music2", label: "ВКонтакте" },
                { icon: "Youtube", label: "YouTube" },
              ].map((s) => (
                <button
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-all hover:border-white/20"
                  style={{
                    background: "var(--radio-surface2)",
                    borderColor: "var(--radio-surface2)",
                    color: "var(--radio-muted)",
                  }}
                >
                  <Icon name={s.icon} size={15} />
                  <span className="font-display text-xs tracking-wide">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

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
                <Icon name="CheckCircle" size={28} style={{ color: "var(--radio-red)" }} />
              </div>
              <h2 className="font-display text-2xl uppercase" style={{ color: "var(--radio-text)" }}>
                Сообщение отправлено
              </h2>
              <p className="text-sm" style={{ color: "var(--radio-muted)" }}>
                Мы ответим вам в ближайшее время.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="mt-2 px-5 py-2 rounded-lg font-display tracking-wide uppercase text-sm"
                style={{ background: "var(--radio-surface2)", color: "var(--radio-text)" }}
              >
                Написать ещё
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl uppercase mb-1" style={{ color: "var(--radio-text)" }}>
                Написать нам
              </h2>
              {[
                { key: "name", label: "Имя", placeholder: "Ваше имя" },
                { key: "email", label: "Email", placeholder: "your@email.com", type: "email" },
                { key: "subject", label: "Тема", placeholder: "О чём хотите написать" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                    {f.label}
                  </label>
                  <input
                    required
                    type={f.type || "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--radio-surface2)",
                      border: "1px solid var(--radio-surface2)",
                      color: "var(--radio-text)",
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-display tracking-widest uppercase mb-1.5" style={{ color: "var(--radio-muted)" }}>
                  Сообщение
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Текст вашего сообщения"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
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
                Отправить
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
