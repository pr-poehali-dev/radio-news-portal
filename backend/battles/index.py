"""
API для батлов: получение списка, голосование, CRUD для админа
"""
import os
import json
import psycopg2

SCHEMA = "t_p65891949_radio_news_portal"
ADMIN_KEY = os.environ.get("BATTLES_ADMIN_KEY", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action") or (event.get("queryStringParameters") or {}).get("action", "list")
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")

    # --- GET: список батлов ---
    if method == "GET" or action == "list":
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT id, title, artist1, artist2, votes1, votes2, is_active, created_at
                    FROM {SCHEMA}.battles
                    ORDER BY id
                """)
                rows = cur.fetchall()
        battles = [
            {
                "id": r[0], "title": r[1],
                "artist1": r[2], "artist2": r[3],
                "votes1": r[4], "votes2": r[5],
                "is_active": r[6], "created_at": str(r[7])
            }
            for r in rows
        ]
        return ok({"battles": battles})

    # --- vote ---
    if action == "vote":
        battle_id = body.get("battle_id")
        choice = body.get("choice")
        if not battle_id or choice not in (1, 2):
            return err("battle_id и choice (1 или 2) обязательны")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT is_active FROM {SCHEMA}.battles WHERE id = %s", (battle_id,))
                row = cur.fetchone()
                if not row:
                    return err("Батл не найден", 404)
                if not row[0]:
                    return err("Батл завершён")

                try:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.battle_votes (battle_id, voter_ip, choice)
                        VALUES (%s, %s, %s)
                    """, (battle_id, ip, choice))
                except psycopg2.errors.UniqueViolation:
                    conn.rollback()
                    return err("Вы уже голосовали в этом батле")

                col = "votes1" if choice == 1 else "votes2"
                cur.execute(f"UPDATE {SCHEMA}.battles SET {col} = {col} + 1, updated_at = NOW() WHERE id = %s RETURNING votes1, votes2", (battle_id,))
                v = cur.fetchone()
            conn.commit()
        return ok({"votes1": v[0], "votes2": v[1]})

    # --- Админские действия (требуют X-Admin-Key) ---
    admin_key = (event.get("headers") or {}).get("X-Admin-Key", "")
    if not ADMIN_KEY or admin_key != ADMIN_KEY:
        return err("Нет доступа", 403)

    # create
    if action == "create":
        a1 = body.get("artist1", "").strip()
        a2 = body.get("artist2", "").strip()
        title = body.get("title", "").strip()
        if not a1 or not a2:
            return err("artist1 и artist2 обязательны")
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.battles (title, artist1, artist2)
                    VALUES (%s, %s, %s) RETURNING id
                """, (title, a1, a2))
                new_id = cur.fetchone()[0]
            conn.commit()
        return ok({"id": new_id, "message": "Батл создан"})

    # update
    if action == "update":
        battle_id = body.get("id")
        if not battle_id:
            return err("id обязателен")
        fields, vals = [], []
        for f in ("title", "artist1", "artist2"):
            if f in body:
                fields.append(f"{f} = %s")
                vals.append(body[f])
        if "is_active" in body:
            fields.append("is_active = %s")
            vals.append(body["is_active"])
        if "reset_votes" in body and body["reset_votes"]:
            fields += ["votes1 = 0", "votes2 = 0"]
        if not fields:
            return err("Нет полей для обновления")
        fields.append("updated_at = NOW()")
        vals.append(battle_id)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {SCHEMA}.battles SET {', '.join(fields)} WHERE id = %s", vals)
            conn.commit()
        return ok({"message": "Батл обновлён"})

    return err("Неизвестный action")
