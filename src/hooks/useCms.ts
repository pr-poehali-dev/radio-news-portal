import { useState, useEffect } from "react";

export const CMS_URL = "https://functions.poehali.dev/a75f03d2-3371-4267-b277-74bfe7859e37";

type SectionData = Record<string, string>;
type PageData = Record<string, SectionData>;

const cache: Record<string, PageData> = {};

export function useCms(page: string): { data: PageData; loading: boolean } {
  const [data, setData] = useState<PageData>(cache[page] || {});
  const [loading, setLoading] = useState(!cache[page]);

  useEffect(() => {
    if (cache[page]) {
      setData(cache[page]);
      setLoading(false);
      return;
    }
    fetch(`${CMS_URL}?page=${page}`)
      .then((r) => r.json())
      .then((json) => {
        const pageData: PageData = json[page] || {};
        cache[page] = pageData;
        setData(pageData);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return { data, loading };
}

/** Удобный хелпер: получить строку из data[section][key] с fallback */
export function g(data: PageData, section: string, key: string, fallback = ""): string {
  return data?.[section]?.[key] ?? fallback;
}

/** Получить распарсенный JSON-массив из data[section][key] */
export function gj<T = unknown>(data: PageData, section: string, key: string, fallback: T[] = []): T[] {
  const raw = data?.[section]?.[key];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

/** Сохранить обновления в CMS (для всех страниц, требует adminKey) */
export async function cmsUpdate(
  updates: { page: string; section: string; content_key: string; value: string }[],
  adminKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(CMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify({ updates }),
    });
    const json = await res.json();
    if (json.error) return { ok: false, error: json.error };
    // Инвалидируем кэш затронутых страниц
    const pages = [...new Set(updates.map((u) => u.page))];
    pages.forEach((p) => delete cache[p]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
