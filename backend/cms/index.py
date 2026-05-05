"""
CMS API: получение и обновление контента страниц сайта
"""
import os
import json
import psycopg2

SCHEMA = "t_p65891949_radio_news_portal"
ADMIN_KEY = os.environ.get("BATTLES_ADMIN_KEY", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    # GET — получить весь контент или контент конкретной страницы
    if method == "GET":
        page = params.get("page")
        with get_conn() as conn:
            with conn.cursor() as cur:
                if page:
                    cur.execute(
                        f"SELECT page, section, content_key, value FROM {SCHEMA}.page_content WHERE page = %s ORDER BY id",
                        (page,)
                    )
                else:
                    cur.execute(
                        f"SELECT page, section, content_key, value FROM {SCHEMA}.page_content ORDER BY page, section, id"
                    )
                rows = cur.fetchall()

        # Структура: { page: { section: { key: value } } }
        result = {}
        for r_page, section, key, value in rows:
            result.setdefault(r_page, {}).setdefault(section, {})[key] = value
        return ok(result)

    # POST — обновить значение (требует X-Admin-Key)
    if method == "POST":
        admin_key = (event.get("headers") or {}).get("X-Admin-Key", "")
        if not ADMIN_KEY or admin_key != ADMIN_KEY:
            return err("Нет доступа", 403)

        updates = body.get("updates")  # [{ page, section, content_key, value }, ...]
        if not updates or not isinstance(updates, list):
            return err("updates — обязательный массив [{page, section, content_key, value}]")

        with get_conn() as conn:
            with conn.cursor() as cur:
                for u in updates:
                    cur.execute(
                        f"""
                        INSERT INTO {SCHEMA}.page_content (page, section, content_key, value, updated_at)
                        VALUES (%s, %s, %s, %s, NOW())
                        ON CONFLICT (page, section, content_key) DO UPDATE
                          SET value = EXCLUDED.value, updated_at = NOW()
                        """,
                        (u["page"], u["section"], u["content_key"], u["value"])
                    )
            conn.commit()
        return ok({"message": f"Обновлено {len(updates)} записей"})

    return err("Метод не поддерживается", 405)
