# SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import os


class Config:
    """Base configuration used by the Flask app and mocks.

    Values are aligned with README.md:
    - Dev: SQLITE `sqlite:///citylegends.db` (via DATABASE_URL або дефолт).
    - SECRET_KEY / REDIS_URL читаються з env для реальних оточень.
    """

    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_something_secret")

    # Primary DB connection. For PostgreSQL 15+ set, for example:
    #   DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:5432/citylegends
    # If not provided, falls back to a local SQLite file for quick dev runs.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///citylegends.db")

    # Disable event system overhead; we don't use SQLAlchemy's modification tracking.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
