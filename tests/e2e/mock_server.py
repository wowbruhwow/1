# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

from flask import Flask, render_template, request, redirect, url_for
from pathlib import Path

app = Flask(__name__, template_folder=str(Path(__file__).parent / "templates"))

# Примітивне зберігання кімнат у памʼяті
ROOMS = {}


@app.get("/")
def home():
    return render_template("home.html", title="City Legends")


@app.get("/auth")
def auth_get():
    return render_template("auth.html")


@app.post("/auth")
def auth_post():
    email = request.form.get("email")
    password = request.form.get("password")

    if not email or not password:
        # 400 + та ж форма з помилкою
        return render_template("auth.html", error="All fields are required"), 400

    # Простий "успішний логін" без реальної авторизації
    return redirect(url_for("lobby"))


@app.get("/lobby")
def lobby():
    return render_template("lobby.html", rooms=ROOMS)


# Створення кімнати з Lobby
@app.post("/create-room")
def create_room():
    room_id = str(len(ROOMS) + 1)
    ROOMS[room_id] = {"id": room_id}
    return redirect(url_for("room", room_id=room_id))


@app.get("/room/<room_id>")
def room(room_id):
    room = ROOMS.get(room_id) or {"id": room_id}
    # 👇 важливо: передаємо і room, і room_id
    return render_template("room.html", room=room, room_id=room_id)


@app.post("/room/<room_id>/join")
def join_room(room_id):
    # На всяк випадок створюємо кімнату, якщо її не було
    if room_id not in ROOMS:
        ROOMS[room_id] = {"id": room_id}
    return redirect(url_for("play", room_id=room_id))


@app.get("/play/<room_id>")
def play(room_id):
    state = request.args.get("state", "idle")
    return render_template("play.html", room_id=room_id, state=state)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)
