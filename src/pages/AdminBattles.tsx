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

export default function AdminBattles() {
  const [key, setKey] = useState(localStorage.getItem("admin_key") || "");
  const [authed, setAuthed] = useState(false);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Battle | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", artist1: "", artist2: "" });
  const [saving, setSaving] = useState(false);

  const adminHeaders = { "Content-Type": "application/json", "X-Admin-Key": key };

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "create", artist1: "__test__", artist2: "__test__" }),
      });
      const data = await res.json();
      if (res.status === 403 || data.error === "Нет доступа") {
        setError("Неверный ключ");
        return;
      }
      localStorage.setItem("admin_key", key);
      setAuthed(true);
      fetchBattles();
    } finally {
      setLoading(false);
    }
  };

  const fetchBattles = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setBattles(data.battles || []);
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    if (creating) {
      await fetch(API, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "create", ...form }),
      });
      setCreating(false);
    } else if (editing) {
      await fetch(API, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ action: "update", id: editing.id, ...form }),
      });
      setEditing(null);
    }
    setForm({ title: "", artist1: "", artist2: "" });
    await fetchBattles();
    setSaving(false);
  };

  const toggleActive = async (battle: Battle) => {
    await fetch(API, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ action: "update", id: battle.id, is_active: !battle.is_active }),
    });
    fetchBattles();
  };

  const resetVotes = async (id: number) => {
    if (!confirm("Сбросить голоса? Это действие нельзя отменить.")) return;
    await fetch(API, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ action: "update", id, reset_votes: true }),
    });
    fetchBattles();
  };

  const startEdit = (b: Battle) => {
    setEditing(b);
    setCreating(false);
    setForm({ title: b.title, artist1: b.artist1, artist2: b.artist2 });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ title: "", artist1: "", artist2: "" });
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--radio-dark)" }}>
        <div className="w-full max-w-sm p-8 rounded-2xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Icon name="Lock" size={18} style={{ color: "var(--radio-red)" }} />
            <h1 className="font-display text-xl uppercase" style={{ color: "var(--radio-text)" }}>Вход в админку</h1>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Секретный ключ"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-3"
            style={{ background: "var(--radio-surface2)", border: "1px solid var(--radio-surface2)", color: "var(--radio-text)" }}
          />
          {error && <p className="text-xs mb-3" style={{ color: "var(--radio-red)" }}>{error}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 rounded-lg font-display tracking-wide uppercase text-sm"
            style={{ background: "var(--radio-red)", color: "#fff" }}
          >
            {loading ? "Проверяю..." : "Войти"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Settings" size={16} style={{ color: "var(--radio-red)" }} />
            <span className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--radio-red)" }}>Админ</span>
          </div>
          <h1 className="font-display text-3xl uppercase" style={{ color: "var(--radio-text)" }}>Управление батлами</h1>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display tracking-wide uppercase text-sm"
          style={{ background: "var(--radio-red)", color: "#fff" }}
        >
          <Icon name="Plus" size={16} />
          Новый батл
        </button>
      </div>

      {/* Create / Edit form */}
      {(creating || editing) && (
        <div className="mb-6 p-6 rounded-xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-red)" }}>
          <h2 className="font-display text-lg uppercase mb-4" style={{ color: "var(--radio-text)" }}>
            {creating ? "Новый батл" : `Редактировать: ${editing?.title}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: "title", label: "Название батла", placeholder: "Батл #11" },
              { key: "artist1", label: "Исполнитель 1", placeholder: "Земфира" },
              { key: "artist2", label: "Исполнитель 2", placeholder: "Ария" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-display tracking-widest uppercase mb-1" style={{ color: "var(--radio-muted)" }}>
                  {f.label}
                </label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--radio-surface2)", border: "1px solid var(--radio-surface2)", color: "var(--radio-text)" }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || !form.artist1 || !form.artist2}
              className="px-5 py-2 rounded-lg font-display tracking-wide uppercase text-sm"
              style={{ background: "var(--radio-red)", color: "#fff", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
            <button
              onClick={() => { setCreating(false); setEditing(null); }}
              className="px-5 py-2 rounded-lg font-display tracking-wide uppercase text-sm"
              style={{ background: "var(--radio-surface2)", color: "var(--radio-muted)" }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Battles list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--radio-red)", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="space-y-3">
          {battles.map((b) => {
            const total = b.votes1 + b.votes2;
            const pct1 = total > 0 ? Math.round((b.votes1 / total) * 100) : 50;
            return (
              <div
                key={b.id}
                className="p-4 rounded-xl border"
                style={{
                  background: "var(--radio-surface)",
                  borderColor: editing?.id === b.id ? "var(--radio-red)" : "var(--radio-surface2)",
                  opacity: b.is_active ? 1 : 0.6,
                }}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Status dot */}
                  <div className={b.is_active ? "live-dot" : "w-2 h-2 rounded-full"} style={b.is_active ? {} : { background: "var(--radio-muted)" }} />

                  {/* Artists */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display tracking-wide uppercase" style={{ color: "var(--radio-muted)" }}>{b.title}</span>
                      {!b.is_active && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-display" style={{ background: "rgba(122,111,99,0.15)", color: "var(--radio-muted)" }}>
                          Завершён
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-display text-sm" style={{ color: "var(--radio-text)" }}>{b.artist1}</span>
                      <span style={{ color: "var(--radio-red)" }} className="font-display text-xs">VS</span>
                      <span className="font-display text-sm" style={{ color: "var(--radio-text)" }}>{b.artist2}</span>
                    </div>
                    {/* Votes bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs w-8 text-right font-display" style={{ color: "var(--radio-muted)" }}>{pct1}%</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--radio-surface2)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct1}%`, background: "var(--radio-red)" }} />
                      </div>
                      <span className="text-xs w-8 font-display" style={{ color: "var(--radio-muted)" }}>{100 - pct1}%</span>
                      <span className="text-xs" style={{ color: "var(--radio-muted)" }}>({total} гол.)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(b)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "var(--radio-surface2)", color: "var(--radio-muted)" }}
                      title="Редактировать"
                    >
                      <Icon name="Pencil" size={14} />
                    </button>
                    <button
                      onClick={() => resetVotes(b.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "var(--radio-surface2)", color: "var(--radio-muted)" }}
                      title="Сбросить голоса"
                    >
                      <Icon name="RotateCcw" size={14} />
                    </button>
                    <button
                      onClick={() => toggleActive(b)}
                      className="px-3 py-2 rounded-lg font-display tracking-wide uppercase text-xs transition-all"
                      style={{
                        background: b.is_active ? "rgba(232,68,26,0.15)" : "rgba(122,111,99,0.15)",
                        color: b.is_active ? "var(--radio-red)" : "var(--radio-muted)",
                      }}
                    >
                      {b.is_active ? "Завершить" : "Открыть"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
