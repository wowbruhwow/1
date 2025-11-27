# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

from __future__ import annotations

from uuid import uuid4

from flask import Flask, jsonify, request

from datetime import datetime


app = Flask(__name__)

CHAT_MESSAGES: dict[str, list[dict]] = {}

# Прості мок-дані кімнат (in-memory, без БД)
ROOMS = [
    {
        "id": "1",
        "name": "Quick demo #1",
        "mode": "quick",
        "maxPlayers": 2,
        "currentPlayers": 1,
        "access": "public",
        "hasPassword": False,
        "status": "waiting",
        "pingMs": 32,
    },
    {
        "id": "2",
        "name": "Classic lobby",
        "mode": "classic",
        "maxPlayers": 4,
        "currentPlayers": 3,
        "access": "public",
        "hasPassword": False,
        "status": "waiting",
        "pingMs": 54,
    },
    {
        "id": "3",
        "name": "Private test room",
        "mode": "quick",
        "maxPlayers": 2,
        "currentPlayers": 0,
        "access": "private",
        "hasPassword": True,
        "status": "waiting",
        "pingMs": 40,
        "_password": "1234",  # внутрішнє поле, не повертаємо у відповіді
    },
]


def error_response(code: str, message: str, http_status: int = 400, details: dict | None = None):
    payload = {
        "ok": False,
        "code": code,
        "message": message,
    }
    if details:
        payload["details"] = details
    return jsonify(payload), http_status


# ---------- Auth endpoints ----------


@app.post("/auth/login")
def auth_login():
    """Мок логіну: приймає будь-які непорожні email+password."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return error_response(
            code="validation_error",
            message="Email та пароль обов'язкові.",
            http_status=400,
            details={"email": "required", "password": "required"},
        )

    user = {
        "id": "u_demo",
        "nickname": data.get("nickname") or "DemoPlayer",
        "email": email,
        "stats": {"matchesPlayed": 10, "wins": 6},
    }

    return jsonify(
        {
            "ok": True,
            "message": "Успішний вхід. Welcome back!",
            "token": "dev-token",
            "user": user,
        }
    )


@app.post("/auth/register")
def auth_register():
    """Мок реєстрації: створює фіктивного користувача й повертає токен."""
    data = request.get_json(silent=True) or {}

    nickname = (data.get("nickname") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    errors: dict[str, str] = {}
    if not nickname:
        errors["nickname"] = "required"
    if len(nickname) > 16:
        errors["nickname"] = "too_long"
    if not email:
        errors["email"] = "required"
    if not password:
        errors["password"] = "required"

    if errors:
        return error_response(
            code="validation_error",
            message="Помилка валідації полів реєстрації.",
            http_status=400,
            details=errors,
        )

    user_id = f"u_{uuid4().hex[:8]}"
    user = {
        "id": user_id,
        "nickname": nickname,
        "email": email,
        "stats": {"matchesPlayed": 0, "wins": 0},
    }

    return jsonify(
        {
            "ok": True,
            "message": "Акаунт створено. Лист підтвердження успішно надіслано.",
            "token": "dev-token",
            "user": user,
        }
    ), 201


@app.post("/auth/reset")
def auth_reset():
    """Мок запиту на відновлення пароля."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()

    if not email:
        return error_response(
            code="validation_error",
            message="Емейл обов'язковий.",
            http_status=400,
            details={"email": "required"},
        )

    return jsonify(
        {
            "ok": True,
            "message": "Лист надіслано. Перевірте свою пошту.",
        }
    )


# ---------- Rooms endpoints ----------


@app.get("/rooms")
def list_rooms():
    """Повертає список кімнат з можливістю простих фільтрів."""
    mode = request.args.get("mode")
    access = request.args.get("access")

    def matches(room: dict) -> bool:
        if mode and room.get("mode") != mode:
            return False
        if access and room.get("access") != access:
            return False
        return True

    rooms = [
        {k: v for k, v in room.items() if not k.startswith("_")}
        for room in ROOMS
        if matches(room)
    ]

    return jsonify({"rooms": rooms})


@app.post("/rooms")
def create_room():
    """Створює нову кімнату у пам'яті й повертає її опис + inviteCode."""
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    mode = data.get("mode") or "quick"
    max_players = data.get("maxPlayers") or 2
    access = data.get("access") or "public"
    password = (data.get("password") or "").strip() if access == "private" else ""

    errors: dict[str, str] = {}
    if not name:
        errors["name"] = "required"
    if mode not in {"quick", "classic"}:
        errors["mode"] = "invalid"
    if max_players not in {2, 4}:
        errors["maxPlayers"] = "invalid"
    if access not in {"public", "private"}:
        errors["access"] = "invalid"
    if access == "private" and len(password) < 4:
        errors["password"] = "too_short"

    if errors:
        return error_response(
            code="validation_error",
            message="Помилка валідації параметрів кімнати.",
            http_status=400,
            details=errors,
        )

    room_id = str(len(ROOMS) + 1)
    room = {
        "id": room_id,
        "name": name,
        "mode": mode,
        "maxPlayers": max_players,
        "currentPlayers": 0,
        "access": access,
        "hasPassword": bool(password),
        "status": "waiting",
        "pingMs": 42,
    }
    if password:
        room["_password"] = password

    ROOMS.append(room)

    public_room = {k: v for k, v in room.items() if not k.startswith("_")}
    invite_code = f"CL-{room_id}"

    return (
        jsonify(
            {
                "ok": True,
                "room": public_room,
                "inviteCode": invite_code,
            }
        ),
        201,
    )


@app.post("/rooms/<room_id>/join")
def join_room(room_id: str):
    """Приєднання до кімнати; повертає wsUrl для підключення до WS-моку."""
    data = request.get_json(silent=True) or {}
    password = (data.get("password") or "").strip()

    room = next((r for r in ROOMS if r.get("id") == room_id), None)
    if room is None:
        return error_response(
            code="not_found",
            message="Кімнату не знайдено.",
            http_status=404,
        )

    if room.get("access") == "private" and room.get("hasPassword"):
        expected = room.get("_password") or ""
        if password != expected:
            return error_response(
                code="forbidden",
                message="Невірний пароль кімнати.",
                http_status=403,
            )

    player_id = f"p_{uuid4().hex[:8]}"

    ws_url = f"ws://localhost:8081/ws/match/{room_id}?token=dev-token&playerId={player_id}"

    public_room = {k: v for k, v in room.items() if not k.startswith("_")}

    return jsonify(
        {
            "ok": True,
            "room": public_room,
            "playerId": player_id,
            "wsUrl": ws_url,
        }
    )

def _now_iso():
    return datetime.utcnow().isoformat() + "Z"


@app.get("/api/chat/<room_id>")
def chat_list(room_id):
    """Отримати історію чату для кімнати."""
    room_msgs = CHAT_MESSAGES.get(room_id, [])

    since_id = request.args.get("sinceId")
    if since_id:
        # знаходимо позицію повідомлення з таким id
        filtered = []
        found = False
        for msg in room_msgs:
            if found:
                filtered.append(msg)
            if msg["id"] == since_id:
                found = True
        return jsonify({"messages": filtered})

    return jsonify({"messages": room_msgs})


@app.post("/api/chat/<room_id>")
def chat_post(room_id):
    """Додати повідомлення в чат кімнати."""
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    author = (data.get("author") or "Гравець").strip() or "Гравець"

    if not text:
        return jsonify({"error": "Text is required"}), 400

    msg = {
        "id": str(uuid4()),
        "author": author,
        "text": text,
        "createdAt": _now_iso(),
    }

    CHAT_MESSAGES.setdefault(room_id, []).append(msg)

    return jsonify({"message": msg}), 201


if __name__ == "__main__":  # pragma: no cover
    # Порт 5002 обрано, щоб не конфліктувати з основним Flask-додатком (5000)
    # та e2e-мок-сервером (5001).
    app.run(host="127.0.0.1", port=5002, debug=False)



