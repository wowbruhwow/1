# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

from __future__ import annotations

from uuid import uuid4

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from .models import ChatMessage, Room, User, chat_message_to_dict, db, room_to_dict, user_to_dict


api_bp = Blueprint("api", __name__)


def error_response(code: str, message: str, http_status: int = 400, details: dict | None = None):
    payload: dict[str, object] = {
        "ok": False,
        "code": code,
        "message": message,
    }
    if details:
        payload["details"] = details
    return jsonify(payload), http_status


# ---------------------- Auth endpoints ----------------------


@api_bp.post("/auth/login")
def auth_login():
    """Login using email + password against the real DB.

    Response shape is aligned with AuthLoginResponse in openapi.yaml.
    """

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return error_response(
            code="validation_error",
            message="Email та пароль обов'язкові.",
            http_status=400,
            details={"email": "required", "password": "required"},
        )

    user: User | None = User.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return error_response(
            code="invalid_credentials",
            message="Невірні дані входу.",
            http_status=401,
        )

    # Persist logged-in user in session for profile / settings pages.
    session["user_id"] = user.id

    return jsonify(
        {
            "ok": True,
            "message": "Успішний вхід. Welcome back!",
            # NOTE: real JWT is out of scope for this prototype; keep dev token.
            "token": "dev-token",
            "user": user_to_dict(user),
        }
    )


@api_bp.post("/auth/register")
def auth_register():
    """Create a new account in the DB.

    Mirrors validation logic from mocks/api/server.py + adds uniqueness checks.
    """

    data = request.get_json(silent=True) or {}

    nickname = (data.get("nickname") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    errors: dict[str, str] = {}
    if not nickname:
        errors["nickname"] = "required"
    elif len(nickname) > 16:
        errors["nickname"] = "too_long"

    if not email:
        errors["email"] = "required"

    if not password:
        errors["password"] = "required"

    # Uniqueness checks
    if email and User.query.filter_by(email=email).first() is not None:
        errors["email"] = errors.get("email") or "already_in_use"
    if nickname and User.query.filter_by(nickname=nickname).first() is not None:
        errors["nickname"] = errors.get("nickname") or "already_in_use"

    if errors:
        return error_response(
            code="validation_error",
            message="Помилка валідації полів реєстрації.",
            http_status=400,
            details=errors,
        )

    user = User(
        nickname=nickname,
        email=email,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    # Автоматично логінимо новий акаунт.
    session["user_id"] = user.id

    return jsonify(
        {
            "ok": True,
            "message": "Акаунт створено. Лист підтвердження успішно надіслано.",
            "token": "dev-token",
            "user": user_to_dict(user),
        }
    ), 201


@api_bp.post("/auth/reset")
def auth_reset():
    """Password reset stub.

    In real backend this would create a reset token & send email.
    """

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return error_response(
            code="validation_error",
            message="Емейл обов'язковий.",
            http_status=400,
            details={"email": "required"},
        )

    # No-op for now: we behave like mock and always succeed.
    return jsonify(
        {
            "ok": True,
            "message": "Лист надіслано. Перевірте свою пошту.",
        }
    )


@api_bp.post("/profile/nickname")
def update_nickname():
    """Update current user's nickname in the database.

    Requires active session (user_id in Flask session).
    """

    user_id = session.get("user_id")
    if not user_id:
        return error_response(
            code="unauthorized",
            message="Потрібно увійти в акаунт.",
            http_status=401,
        )

    data = request.get_json(silent=True) or {}
    nickname = (data.get("nickname") or "").strip()

    errors: dict[str, str] = {}
    if not nickname:
        errors["nickname"] = "required"
    elif len(nickname) > 16:
        errors["nickname"] = "too_long"

    # Перевірка унікальності ніку
    if not errors:
        existing = (
            User.query.filter(User.nickname == nickname, User.id != user_id)
            .first()
        )
        if existing is not None:
            errors["nickname"] = "already_in_use"

    if errors:
        return error_response(
            code="validation_error",
            message="Помилка валідації ніку.",
            http_status=400,
            details=errors,
        )

    user = User.query.get(user_id)
    if user is None:
        session.pop("user_id", None)
        return error_response(
            code="unauthorized",
            message="Потрібно увійти в акаунт.",
            http_status=401,
        )

    user.nickname = nickname
    db.session.commit()

    return jsonify(
        {
            "ok": True,
            "message": "Зміни збережено.",
            "user": user_to_dict(user),
        }
    )


# ---------------------- Rooms endpoints ----------------------


@api_bp.get("/rooms")
def list_rooms():
    """Return a list of rooms with simple filters (mode, access, pagination)."""

    mode = request.args.get("mode")  # quick | classic | None
    access = request.args.get("access")  # public | private | None

    try:
        limit = int(request.args.get("limit", "20"))
    except ValueError:
        limit = 20
    limit = max(1, min(limit, 100))

    try:
        offset = int(request.args.get("offset", "0"))
    except ValueError:
        offset = 0
    offset = max(0, offset)

    query = Room.query
    if mode:
        query = query.filter_by(mode=mode)
    if access:
        query = query.filter_by(access=access)

    rooms = (
        query.order_by(Room.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return jsonify({"rooms": [room_to_dict(r) for r in rooms]})


@api_bp.post("/rooms")
def create_room():
    """Create a new room.

    Mirrors validation from mocks/api/server.py and returns inviteCode.
    """

    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    mode = (data.get("mode") or "quick").strip()
    max_players = data.get("maxPlayers") or 2
    access = (data.get("access") or "public").strip()
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

    turn_duration = 30 if mode == "quick" else 45

    room = Room(
        name=name,
        mode=mode,
        max_players=max_players,
        current_players=0,
        access=access,
        has_password=bool(password),
        status="waiting",
        ping_ms=42,
        turn_duration_sec=turn_duration,
    )
    if password:
        room.password_hash = generate_password_hash(password)

    db.session.add(room)
    db.session.flush()  # ensure room.id is populated

    # Simple predictable invite code compatible with DETAILED_STRUCTURE.md
    room.invite_code = f"CL-{room.id}"
    db.session.commit()

    public_room = room_to_dict(room)
    invite_code = room.invite_code

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


@api_bp.post("/rooms/<room_id>/join")
def join_room(room_id: str):
    """Join a room and get wsUrl for WS mock.

    Password-protected rooms require correct password.
    """

    data = request.get_json(silent=True) or {}
    password = (data.get("password") or "").strip()

    # room_id is path param as string but DB id is integer
    try:
        room_pk = int(room_id)
    except ValueError:
        return error_response(
            code="not_found",
            message="Кімнату не знайдено.",
            http_status=404,
        )

    room: Room | None = Room.query.get(room_pk)
    if room is None:
        return error_response(
            code="not_found",
            message="Кімнату не знайдено.",
            http_status=404,
        )

    if room.access == "private" and room.has_password:
        expected_hash = room.password_hash or ""
        if not expected_hash or not check_password_hash(expected_hash, password):
            return error_response(
                code="forbidden",
                message="Невірний пароль кімнати.",
                http_status=403,
            )

    # Simple capacity check; in real backend we would enforce this strictly.
    if room.current_players >= room.max_players:
        return error_response(
            code="room_full",
            message="Кімната заповнена.",
            http_status=403,
        )

    player_id = f"p_{uuid4().hex[:8]}"

    # Hard-coded WS mock URL aligned with mocks/ws-mock.js and docs/dev/api/ws-events.md
    ws_url = f"ws://localhost:8081/ws/match/{room_id}?token=dev-token&playerId={player_id}"

    room.current_players += 1
    db.session.commit()

    public_room = room_to_dict(room)

    return jsonify(
        {
            "ok": True,
            "room": public_room,
            "playerId": player_id,
            "wsUrl": ws_url,
        }
    )


# ---------------------- Chat endpoints ----------------------


@api_bp.get("/api/chat/<room_id>")
def chat_list(room_id: str):
    """Get chat history for a room.

    Implements sinceId semantics similar to mocks/api/server.py.
    """

    try:
        room_pk = int(room_id)
    except ValueError:
        return jsonify({"messages": []})

    # Ensure room exists (optional but nice for early 404).
    room: Room | None = Room.query.get(room_pk)
    if room is None:
        return jsonify({"messages": []})

    since_id = request.args.get("sinceId")

    query = (
        ChatMessage.query.filter_by(room_id=room_pk)
        .order_by(ChatMessage.created_at.asc())
    )

    msgs = list(query.all())

    if since_id:
        filtered: list[ChatMessage] = []
        found = False
        for msg in msgs:
            if found:
                filtered.append(msg)
            if msg.id == since_id:
                found = True
        msgs = filtered

    return jsonify({"messages": [chat_message_to_dict(m) for m in msgs]})


@api_bp.post("/api/chat/<room_id>")
def chat_post(room_id: str):
    """Append a message to room chat and return it."""

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    author = (data.get("author") or "Гравець").strip() or "Гравець"

    if not text:
        return jsonify({"error": "Text is required"}), 400

    try:
        room_pk = int(room_id)
    except ValueError:
        return jsonify({"error": "Room not found"}), 404

    room: Room | None = Room.query.get(room_pk)
    if room is None:
        return jsonify({"error": "Room not found"}), 404

    msg = ChatMessage(room_id=room_pk, author=author, text=text)
    db.session.add(msg)
    db.session.commit()

    return jsonify({"message": chat_message_to_dict(msg)}), 201
