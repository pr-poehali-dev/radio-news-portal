import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CMS_URL, cmsUpdate } from "@/hooks/useCms";

// ─── Типы ────────────────────────────────────────────────────────────────────
type CmsData = Record<string, Record<string, Record<string, string>>>;

interface FieldDef {
  section: string;
  key: string;
  label: string;
  type?: "text" | "textarea" | "json";
  jsonLabel?: string;
}

// ─── Описание редактируемых полей по страницам ───────────────────────────────
const PAGES: { id: string; label: string; icon: string; fields: FieldDef[] }[] = [
  {
    id: "index",
    label: "Главная",
    icon: "Home",
    fields: [
      { section: "hero", key: "title", label: "Заголовок", type: "text" },
      { section: "hero", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      { section: "hero", key: "btn_request", label: "Кнопка «Заказать»", type: "text" },
      { section: "hero", key: "btn_contests", label: "Кнопка «Конкурсы»", type: "text" },
      { section: "schedule", key: "title", label: "Заголовок расписания", type: "text" },
      {
        section: "schedule", key: "items", label: "Расписание (JSON)", type: "json",
        jsonLabel: '[{"time":"07:00","title":"Название шоу","host":"Имя ведущего"}]',
      },
    ],
  },
  {
    id: "news",
    label: "Новости",
    icon: "Newspaper",
    fields: [
      { section: "header", key: "title", label: "Заголовок страницы", type: "text" },
      { section: "header", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      {
        section: "articles", key: "items", label: "Статьи (JSON)", type: "json",
        jsonLabel: '[{"id":1,"date":"26 апреля","category":"Анонс","title":"Заголовок","text":"Текст новости"}]',
      },
    ],
  },
  {
    id: "contests",
    label: "Конкурсы",
    icon: "Trophy",
    fields: [
      { section: "header", key: "title", label: "Заголовок страницы", type: "text" },
      { section: "header", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      {
        section: "items", key: "list", label: "Конкурсы (JSON)", type: "json",
        jsonLabel: '[{"id":1,"status":"active","title":"Название","description":"Описание","deadline":"До 15 мая","prize":"10 000 ₽"}]',
      },
    ],
  },
  {
    id: "votes",
    label: "Голосования",
    icon: "BarChart2",
    fields: [
      { section: "header", key: "title", label: "Заголовок страницы", type: "text" },
      { section: "header", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      {
        section: "polls", key: "list", label: "Опросы (JSON)", type: "json",
        jsonLabel: '[{"id":1,"question":"Вопрос?","options":["Вариант 1","Вариант 2"]}]',
      },
    ],
  },
  {
    id: "about",
    label: "О радио",
    icon: "Radio",
    fields: [
      { section: "hero", key: "title", label: "Заголовок", type: "text" },
      { section: "hero", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      { section: "mission", key: "text", label: "Текст миссии", type: "textarea" },
      {
        section: "stats", key: "items", label: "Статистика (JSON)", type: "json",
        jsonLabel: '[{"value":"128k","label":"слушателей в день"}]',
      },
      {
        section: "team", key: "items", label: "Команда (JSON)", type: "json",
        jsonLabel: '[{"name":"Имя","role":"Роль","time":"07:00–10:00"}]',
      },
      {
        section: "platforms", key: "items", label: "Платформы (JSON)", type: "json",
        jsonLabel: '[{"name":"Apple Podcasts","url":"#"}]',
      },
    ],
  },
  {
    id: "contacts",
    label: "Контакты",
    icon: "MessageSquare",
    fields: [
      { section: "header", key: "title", label: "Заголовок страницы", type: "text" },
      { section: "header", key: "subtitle", label: "Подзаголовок", type: "textarea" },
      {
        section: "info", key: "items", label: "Контакты (JSON)", type: "json",
        jsonLabel: '[{"icon":"Phone","label":"Телефон","value":"+7 (800) 000-00-00"}]',
      },
      {
        section: "social", key: "items", label: "Соцсети (JSON)", type: "json",
        jsonLabel: '[{"icon":"Send","label":"Telegram","url":"https://t.me/..."}]',
      },
    ],
  },
  {
    id: "requests",
    label: "Заказ песни",
    icon: "Music",
    fields: [
      { section: "header", key: "title", label: "Заголовок страницы", type: "text" },
      { section: "header", key: "subtitle", label: "Подзаголовок", type: "textarea" },
    ],
  },
];

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function Admin() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("admin_key") || "");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [cmsData, setCmsData] = useState<CmsData>({});
  const [edits, setEdits] = useState<CmsData>({});
  const [activePage, setActivePage] = useState("index");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  const login = async () => {
    setAuthLoading(true);
    setAuthError("");
    // Проверяем ключ, пытаясь сделать пустой POST
    const res = await fetch(CMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify({ updates: [] }),
    });
    const json = await res.json();
    setAuthLoading(false);
    if (res.status === 403 || json.error === "Нет доступа") {
      setAuthError("Неверный ключ");
      return;
    }
    localStorage.setItem("admin_key", adminKey);
    setAuthed(true);
  };

  const loadAll = useCallback(async () => {
    const res = await fetch(CMS_URL);
    const json = await res.json();
    setCmsData(json);
    setEdits(JSON.parse(JSON.stringify(json)));
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  const getValue = (page: string, section: string, key: string) =>
    edits?.[page]?.[section]?.[key] ?? cmsData?.[page]?.[section]?.[key] ?? "";

  const setValue = (page: string, section: string, key: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [page]: { ...(prev[page] || {}), [section]: { ...(prev[page]?.[section] || {}), [key]: value } },
    }));
    // Валидация JSON
    const fieldId = `${page}.${section}.${key}`;
    const pageConf = PAGES.find((p) => p.id === page);
    const field = pageConf?.fields.find((f) => f.section === section && f.key === key);
    if (field?.type === "json") {
      try { JSON.parse(value); setJsonErrors((e) => { const n = { ...e }; delete n[fieldId]; return n; }); }
      catch { setJsonErrors((e) => ({ ...e, [fieldId]: "Некорректный JSON" })); }
    }
  };

  const save = async () => {
    // Собираем только изменённые поля
    const updates: { page: string; section: string; content_key: string; value: string }[] = [];
    for (const page of Object.keys(edits)) {
      for (const section of Object.keys(edits[page] || {})) {
        for (const key of Object.keys(edits[page][section] || {})) {
          const newVal = edits[page][section][key];
          const oldVal = cmsData?.[page]?.[section]?.[key];
          if (newVal !== oldVal) updates.push({ page, section, content_key: key, value: newVal });
        }
      }
    }
    if (!updates.length) { setSaveMsg("Нет изменений"); setTimeout(() => setSaveMsg(""), 2000); return; }
    if (Object.keys(jsonErrors).length) { setSaveMsg("Исправьте ошибки JSON перед сохранением"); setTimeout(() => setSaveMsg(""), 3000); return; }

    setSaving(true);
    const result = await cmsUpdate(updates, adminKey);
    setSaving(false);
    if (result.ok) {
      setSaveMsg(`Сохранено ${updates.length} изменений ✓`);
      await loadAll();
    } else {
      setSaveMsg(`Ошибка: ${result.error}`);
    }
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const discardPage = () => {
    setEdits((prev) => ({ ...prev, [activePage]: JSON.parse(JSON.stringify(cmsData[activePage] || {})) }));
  };

  const hasChanges = () => {
    for (const page of Object.keys(edits)) {
      for (const section of Object.keys(edits[page] || {})) {
        for (const key of Object.keys(edits[page][section] || {})) {
          if (edits[page][section][key] !== (cmsData?.[page]?.[section]?.[key] ?? "")) return true;
        }
      }
    }
    return false;
  };

  // ─── Экран входа ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--radio-dark)" }}>
        <div className="w-full max-w-sm p-8 rounded-2xl border" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Settings2" size={20} style={{ color: "var(--radio-red)" }} />
            <h1 className="font-display text-xl uppercase" style={{ color: "var(--radio-text)" }}>Панель управления</h1>
          </div>
          <p className="text-xs mb-6" style={{ color: "var(--radio-muted)" }}>Введите секретный ключ для доступа к редактору</p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Секретный ключ"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-3"
            style={{ background: "var(--radio-surface2)", border: "1px solid var(--radio-surface2)", color: "var(--radio-text)" }}
          />
          {authError && <p className="text-xs mb-3" style={{ color: "var(--radio-red)" }}>{authError}</p>}
          <button onClick={login} disabled={authLoading} className="w-full py-3 rounded-lg font-display tracking-wide uppercase text-sm" style={{ background: "var(--radio-red)", color: "#fff", opacity: authLoading ? 0.7 : 1 }}>
            {authLoading ? "Проверяю..." : "Войти"}
          </button>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs" style={{ color: "var(--radio-muted)" }}>← На сайт</Link>
          </div>
        </div>
      </div>
    );
  }

  const activePageConf = PAGES.find((p) => p.id === activePage)!;

  // ─── Редактор ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: "var(--radio-dark)" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r flex flex-col" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--radio-surface2)" }}>
          <div className="flex items-center gap-2">
            <Icon name="Settings2" size={16} style={{ color: "var(--radio-red)" }} />
            <span className="font-display text-sm uppercase" style={{ color: "var(--radio-text)" }}>Редактор</span>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {PAGES.map((p) => {
            const isActive = p.id === activePage;
            const hasDiff = Object.keys(edits[p.id] || {}).some((section) =>
              Object.keys(edits[p.id][section] || {}).some(
                (key) => edits[p.id][section][key] !== (cmsData?.[p.id]?.[section]?.[key] ?? "")
              )
            );
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{ background: isActive ? "rgba(232,68,26,0.12)" : "transparent", color: isActive ? "var(--radio-text)" : "var(--radio-muted)" }}
              >
                <Icon name={p.icon} size={15} style={{ color: isActive ? "var(--radio-red)" : "var(--radio-muted)" }} />
                <span className="font-display text-xs tracking-wide uppercase flex-1">{p.label}</span>
                {hasDiff && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--radio-amber)" }} />}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2" style={{ borderColor: "var(--radio-surface2)" }}>
          <Link to="/admin/battles" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ background: "var(--radio-surface2)", color: "var(--radio-muted)" }}>
            <Icon name="Swords" size={15} />
            <span className="font-display text-xs tracking-wide uppercase">Батлы</span>
          </Link>
          <Link to="/" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ color: "var(--radio-muted)" }}>
            <Icon name="ArrowLeft" size={15} />
            <span className="font-display text-xs tracking-wide uppercase">На сайт</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b shrink-0" style={{ background: "var(--radio-surface)", borderColor: "var(--radio-surface2)" }}>
          <div>
            <h2 className="font-display text-lg uppercase" style={{ color: "var(--radio-text)" }}>{activePageConf.label}</h2>
            <p className="text-xs" style={{ color: "var(--radio-muted)" }}>Изменения применяются сразу после сохранения</p>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className="text-xs px-3 py-1.5 rounded-lg font-display" style={{ background: saveMsg.includes("Ошибк") ? "rgba(232,68,26,0.15)" : "rgba(34,197,94,0.1)", color: saveMsg.includes("Ошибк") ? "var(--radio-red)" : "#4ade80" }}>
                {saveMsg}
              </span>
            )}
            <button onClick={discardPage} className="px-4 py-2 rounded-lg font-display tracking-wide uppercase text-xs" style={{ background: "var(--radio-surface2)", color: "var(--radio-muted)" }}>
              Сбросить
            </button>
            <button onClick={save} disabled={saving || !hasChanges()} className="flex items-center gap-2 px-5 py-2 rounded-lg font-display tracking-wide uppercase text-xs transition-all" style={{ background: "var(--radio-red)", color: "#fff", opacity: saving || !hasChanges() ? 0.6 : 1 }}>
              <Icon name="Save" size={14} />
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
          </div>
        </header>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl space-y-5">
            {activePageConf.fields.map((field) => {
              const fieldId = `${activePage}.${field.section}.${field.key}`;
              const value = getValue(activePage, field.section, field.key);
              const jsonErr = jsonErrors[fieldId];
              const isChanged = value !== (cmsData?.[activePage]?.[field.section]?.[field.key] ?? "");

              return (
                <div key={fieldId} className="rounded-xl border p-5" style={{ background: "var(--radio-surface)", borderColor: isChanged ? "rgba(232,68,26,0.4)" : "var(--radio-surface2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-display text-xs tracking-widest uppercase" style={{ color: isChanged ? "var(--radio-red)" : "var(--radio-muted)" }}>
                      {field.label}
                    </label>
                    <span className="text-xs" style={{ color: "var(--radio-surface2)" }}>{field.section} / {field.key}</span>
                  </div>

                  {field.type === "json" ? (
                    <>
                      <textarea
                        value={value}
                        onChange={(e) => setValue(activePage, field.section, field.key, e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg text-xs outline-none resize-y font-mono"
                        style={{ background: "var(--radio-surface2)", border: `1px solid ${jsonErr ? "var(--radio-red)" : "var(--radio-surface2)"}`, color: "var(--radio-text)", lineHeight: 1.6 }}
                      />
                      {jsonErr && <p className="text-xs mt-1" style={{ color: "var(--radio-red)" }}>{jsonErr}</p>}
                      {field.jsonLabel && (
                        <p className="text-xs mt-1.5" style={{ color: "var(--radio-muted)" }}>
                          Формат: <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--radio-surface2)" }}>{field.jsonLabel}</code>
                        </p>
                      )}
                    </>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => setValue(activePage, field.section, field.key, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y"
                      style={{ background: "var(--radio-surface2)", border: "1px solid var(--radio-surface2)", color: "var(--radio-text)" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(activePage, field.section, field.key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "var(--radio-surface2)", border: "1px solid var(--radio-surface2)", color: "var(--radio-text)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
