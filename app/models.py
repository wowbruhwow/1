# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class TimestampMixin:
    """Adds created_at / updated_at timestamps."""

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class User(TimestampMixin, db.Model):
    """Registered player account.

    Backed by AuthUser schema in docs/dev/api/openapi.yaml.
    """

    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    nickname = db.Column(db.String(16), nullable=False, unique=True, index=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    matches_played = db.Column(db.Integer, nullable=False, default=0)
    wins = db.Column(db.Integer, nullable=False, default=0)


class Room(TimestampMixin, db.Model):
    """Matchmaking room / lobby.

    Aligned with Room / RoomCreateRequest schemas.
    """

    __tablename__ = "rooms"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    mode = db.Column(db.String(16), nullable=False, default="quick")  # quick | classic
    max_players = db.Column(db.Integer, nullable=False, default=2)
    current_players = db.Column(db.Integer, nullable=False, default=0)

    access = db.Column(db.String(16), nullable=False, default="public")  # public | private
    has_password = db.Column(db.Boolean, nullable=False, default=False)
    password_hash = db.Column(db.String(255), nullable=True)

    status = db.Column(db.String(32), nullable=False, default="waiting")
    ping_ms = db.Column(db.Integer, nullable=False, default=42)

    # Optional extra for invites / links.
    invite_code = db.Column(db.String(32), nullable=True, unique=True)

    # Turn duration in seconds (30 quick / 45 classic).
    turn_duration_sec = db.Column(db.Integer, nullable=False, default=30)


class ChatMessage(TimestampMixin, db.Model):
    """Per-room chat history.

    Used by /api/chat/<room_id> for lobby chat.
    """

    __tablename__ = "chat_messages"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    room_id = db.Column(db.Integer, db.ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)

    author = db.Column(db.String(64), nullable=False)
    text = db.Column(db.Text, nullable=False)

    room = db.relationship(Room, backref=db.backref("messages", lazy="dynamic", cascade="all, delete-orphan"))


def utc_iso(dt: datetime | None) -> str | None:
    """Render datetime as ISO-8601 with Z suffix (UTC) for JSON payloads."""

    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "nickname": user.nickname,
        "email": user.email,
        "stats": {
            "matchesPlayed": user.matches_played,
            "wins": user.wins,
        },
    }


def room_to_dict(room: Room) -> dict:
    return {
        "id": str(room.id),
        "name": room.name,
        "mode": room.mode,
        "maxPlayers": room.max_players,
        "currentPlayers": room.current_players,
        "access": room.access,
        "hasPassword": room.has_password,
        "status": room.status,
        "pingMs": room.ping_ms,
    }


def chat_message_to_dict(msg: ChatMessage) -> dict:
    return {
        "id": msg.id,
        "author": msg.author,
        "text": msg.text,
        "createdAt": utc_iso(msg.created_at),
    }
