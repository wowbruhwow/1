# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import os

from flask import Flask, redirect, render_template, send_from_directory, session, url_for

from config import Config
from .api import api_bp
from .models import User, db


def create_app(test_config=None):
    """Application factory.

    Sets up Flask, config, database and HTTP API endpoints.
    """
    app = Flask(__name__, instance_relative_config=True)

    # Load base config + optional overrides for tests.
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    # Initialise SQLAlchemy and create tables on startup.
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # Register JSON API (auth, rooms, chat) on the same app instance.
    app.register_blueprint(api_bp)

    # ---------- Public pages ----------
    @app.route("/")
    def home():
        """Landing page with primary CTA buttons (play, auth, etc.)."""
        return render_template("home-start.html")

    @app.route("/auth")
    def auth_choice():
        """Auth choice screen with buttons "Увійти" / "Зареєструватися"."""
        return render_template("auth.html")

    @app.route("/authentication")
    def auth_login():
        """Login form (Емейл + Пароль)."""
        return render_template("authentication.html")

    @app.route("/registration")
    def auth_register():
        """Registration form (нік, email, паролі, чекбокс)."""
        return render_template("registration.html")

    @app.route("/reset-password")
    def reset_password():
        """Password recovery form (email only)."""
        return render_template("reset-password.html")
    
    @app.route("/settings")
    def settings():
        """Player settings page.

        Requires an authenticated user; otherwise redirects to /auth.
        """
        user_id = session.get("user_id")
        user = User.query.get(user_id) if user_id else None
        if not user:
            return redirect(url_for("auth_choice"))
        return render_template("player-setting.html", user=user)

    @app.route("/profile")
    def profile():
        """Profile / lobby page bound to current logged-in user."""
        user = None
        user_id = session.get("user_id")
        if user_id:
            user = User.query.get(user_id)
        if not user:
            # If there's no valid session, send user to auth choice.
            return redirect(url_for("auth_choice"))
        return render_template("player-profile.html", user=user)

    @app.route("/auth/logout")
    def auth_logout_page():
        """Log out current user and redirect to auth choice screen."""
        session.pop("user_id", None)
        return redirect(url_for("auth_choice"))

    @app.route("/faq")
    def faq():
        """FAQ page (rendered inside a modal on home-start)."""
        return render_template("faq.html")

    @app.route("/how-to-play")
    def how_to_play():
        """How-to-play page with rules inside a panel."""
        return render_template("how-to-play.html")
    
    @app.route("/playable-window")
    def go_to_play():
        """playable-window."""
        return render_template("playable-window.html")

    # ---------- Static mocks for front-end-only auth flows ----------
    @app.route("/mocks/api/auth/<path:filename>")
    def auth_mocks(filename: str):
        """Serve JSON mocks for auth flows (login/register/reset)."""
        base_dir = os.path.join(app.root_path, "..", "mocks", "api", "auth")
        return send_from_directory(base_dir, filename)

    # ---------- Design assets (art) served for UI prototypes ----------
    @app.route("/assets/art/<path:filename>")
    def art_assets(filename: str):
        """Serve design art assets (e.g., Agree_Mark_ART.png) for UI prototypes."""
        base_dir = os.path.join(app.root_path, "..", "design", "screenshots_photos", "art_assets")
        return send_from_directory(base_dir, filename)
    
    @app.route("/faq-about-cards")
    def faq_about_cards():
        """Page with FAQ about cards (opens in new tab)."""
        return render_template("faq-about-cards.html")
    
    return app
