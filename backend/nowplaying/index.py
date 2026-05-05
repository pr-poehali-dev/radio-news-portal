"""
Получение текущего трека Радио Генезия через ICY metadata из потока
"""
import urllib.request
import json
import re


STREAM_URL = "https://myradio24.org/genesia"


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        req = urllib.request.Request(
            STREAM_URL,
            headers={
                "Icy-MetaData": "1",
                "User-Agent": "Mozilla/5.0 (compatible; RadioPlayer/1.0)",
                "Range": "bytes=0-16384",
            },
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            icy_metaint = int(resp.headers.get("icy-metaint", 0))
            icy_name = resp.headers.get("icy-name", "")

            title = ""
            artist = ""

            if icy_metaint > 0:
                resp.read(icy_metaint)
                meta_len_byte = resp.read(1)
                if meta_len_byte:
                    meta_len = ord(meta_len_byte) * 16
                    if meta_len > 0:
                        meta_bytes = resp.read(meta_len)
                        meta_str = meta_bytes.decode("utf-8", errors="ignore").rstrip("\x00")
                        m = re.search(r"StreamTitle='([^']*)'", meta_str)
                        if m:
                            stream_title = m.group(1).strip()
                            if " - " in stream_title:
                                parts = stream_title.split(" - ", 1)
                                artist = parts[0].strip()
                                title = parts[1].strip()
                            else:
                                title = stream_title

            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "title": title or icy_name or "Радио Генезия",
                    "artist": artist,
                    "station": icy_name,
                }),
            }

    except Exception as e:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"title": "Радио Генезия", "artist": "", "error": str(e)}),
        }