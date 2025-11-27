<!-- SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Docs -->

# City Legends — Proprietary Web Board Game

**INTERNAL & CONFIDENTIAL — DO NOT DISTRIBUTE**

**A Flask-based prototype for a competitive, card-driven board game.**
**This repository contains a minimal web app (server, templates, static), documentation, and UI/UX assets used for internal development.**

**Game concept: `docs/description/CONCEPT.md`**

**Site structure: `docs/description/DETAILED_STRUCTURE.md`**

**Design docs:**
- **`design/screenshots_photos/website_design/SITE_LOGIC.md`** – site-wide UI logic and behavior across screens (auth, lobby/chat, room flows), incl. dialog/toast rules.
- **`design/screenshots_photos/button_design/BUTTON.md`** – button system guidelines: types, required states, interaction behavior, sizing/spacing, accessibility.
- **`design/screenshots_photos/art_assets/ART.md`** – visual details for system messages (toasts, typography, colors).

## Tech stack
- **Python 3.10+**
- **Flask 3** (Jinja2, Werkzeug)
- **HTML / CSS / JS** (Jinja2 templates + static)
- **Databases:** PostgreSQL 15+ (dev/staging/prod)
- **Realtime:** WebSockets (local WS mock provided; Redis reserved for presence/pub-sub)
- **Testing:** Playwright (E2E; locally and in CI)
- **CI/CD:** GitHub Actions (.github/workflows/ci.yml)

## Project structure
```text
city-legends/
├── app/
│   ├── __init__.py                    # Flask app & routes (public pages + static mock mounts)
│   ├── templates/
│   │   ├── home-start.html            # Home (landing, overlays for FAQ / How-to)
│   │   ├── auth.html                  # Auth entry (login/register chooser)
│   │   ├── authentication.html        # Login
│   │   ├── registration.html          # Sign-up
│   │   ├── reset-password.html        # Password reset
│   │   ├── faq.html                   # FAQ (also used in overlay)
│   │   ├── faq-about-cards.html       # FAQ: about cards (separate page)
│   │   ├── how-to-play.html           # Short rules page (overlay source)
│   │   ├── player-profile.html        # Profile / lobby
│   │   ├── player-setting.html        # Player settings
│   │   ├── playable-window.html       # Play screen (HUD, boards, chat/log)
│   │   ├── components-demo.html       # Internal UI components + A11y demo (dev)
│   │   ├── ui-preview.html            # UI/a11y preview (dev, uses shared UI kit)
│   │   └── partials/                  # Reusable HTML snippets (UI kit)
│   │       ├── button.html
│   │       ├── card.html
│   │       ├── input.html
│   │       ├── modal.html
│   │       └── toast.html
│   └── static/
│       ├── css/
│       │   ├── style.css              # Global styles, design tokens, responsive layout, sticky footer helpers & shared UI kit
│       │   ├── home-start.css         # Home / start screen layout
│       │   ├── auth.css               # Shared auth shell layouts
│       │   ├── authentication.css     # Login / auth forms
│       │   ├── registration.css       # Registration forms
│       │   ├── reset-password.css     # Reset Password styles (form, inputs, validation messages)
│       │   ├── faq.css                # FAQ page styles (layout, Q/A blocks, collapsibles)
│       │   ├── how-to-play.css        # "How to play" (short rules) page styles
│       │   ├── player-profile.css     # Profile / lobby styles
│       │   ├── player-setting.css     # Settings page styles
│       │   ├── playable-window.css    # In-game HUD, boards, and in-game modals
│       │   └── reset-page.css         # Legacy reset
│       └── js/
│           ├── ui.js                  # Shared UI helpers (buttons, modals, toast, progress, password validation)
│           ├── home-start.js          # Home / start logic + FAQ/How-to overlays
│           ├── faq.js                 # FAQ iframe behavior (Back/Esc → close overlay)
│           ├── how-to-play.js         # How-to-play iframe behavior (Back/Esc → close overlay)
│           ├── auth.js                # Auth / registration flows
            ├── play.js                # Local FSM for Play screen (idle→starting→myTurn/theirTurn→finished)
│           └── script.js              # Game & lobby UI logic (profile, settings, in-game modals)
├── config.py                          # App configuration (SECRET_KEY, DATABASE_URL, REDIS_URL)
├── run.py                             # Dev entrypoint
├── design/
│   ├── LICENSE-assets                 # Proprietary license for assets
│   ├── README_ALL.md                  # Design notes
│   └── screenshots_photos/
│       ├── art_assets/
│       │   └── ART.md                 # Visual details
│       ├── button_design/
│       │   └── BUTTON.md              # Button components spec
│       └── website_design/
│           └── SITE_LOGIC.md          # UI flows & site logic
├── docs/
│   ├── LICENSE-docs                   # Proprietary license for docs
│   ├── README.md                      # Docs index
│   ├── dev/
│   │   ├── ABOUT_SCRIPT.md            # UI/A11y usage; how to run local mocks
│   │   └── api/
│   │       ├── openapi.yaml           # REST API contract (auth, rooms)
│   │       └── ws-events.md           # WebSocket events & payloads (match flow)
│   ├── QA/
│   │   └── TEST_PLAN.md               # QA test plan (scope, envs, E2E/API/a11y, pass/fail criteria)
│   └── description/
│       ├── CONCEPT.md                 # Game concept and balance rules for City Legends (core mechanics, cards, victory conditions)
│       └── DETAILED_STRUCTURE.md      # Detailed site structure and UI text mapping for City Legends web client (pages, navigation, microcopy)
├── mocks/
│   ├── api/
│   │   └── server.py                  # Flask HTTP mock (auth/login|register|reset; rooms list|create|join; chat)
│   ├── ws-mock.js                     # WebSocket mock server for match events
│   └── api/auth/                      # JSON fixtures for auth flows
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI pipeline (Node + Python; Playwright smoke)
├── tests/
│   └── e2e/
│       ├── mock_server.py             # Playwright mock app (port 5001)
│       ├── playwright.config.ts       # Starts mock_server and runs smoke tests
│       ├── smoke.spec.ts              # Smoke: Home → Auth → Rooms → Play
│       ├── templates/                 # HTML fixtures used by tests (if any)
│       ├── package.json             
│       └── package-lock.json
├── test-results/                      # Generated by Playwright (ignored)
├── last-run.json                      # Generated by Playwright (ignored)
├── LICENSE
├── .gitignore
├── .gitattributes
├── requirements.txt
└── README.md
```

## Public routes (dev)
- **/** – home-start.html
- **/auth, /authentication, /registration, /reset-password**
- **/settings, /profile**
- **/faq, /faq-about-cards, /how-to-play**
- **/playable-window**

The app also mounts static mocks under /mocks/api/auth/* and art assets under /assets/art/* for FE prototypes.

## Quick start (development)

### 1) Clone & environment
```bash
git clone git@github.com:City-Legends/city-legends.git
cd city-legends

python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

### 2) Configure database (PostgreSQL 15+)
Before starting the main app, point it to your local PostgreSQL instance via `DATABASE_URL`. On first run, `python run.py` will automatically create all required tables in that database.

1. Ensure PostgreSQL 15+ is installed and running on your machine.
2. (Optional but recommended) Create a dedicated user and database, for example:
```sql
CREATE DATABASE citylegends;
CREATE USER city_user WITH PASSWORD 'city_pass';
GRANT ALL PRIVILEGES ON DATABASE citylegends TO city_user;
```
3. Export `DATABASE_URL` in your shell:
   - **PowerShell (Windows):**
```powershell
$env:DATABASE_URL = "postgresql+psycopg2://city_user:city_pass@localhost:5432/citylegends"
```
   - **bash/zsh (macOS / Linux):**
```bash
export DATABASE_URL="postgresql+psycopg2://city_user:city_pass@localhost:5432/citylegends"
```
If `DATABASE_URL` is not set, the app falls back to a local SQLite file `sqlite:///citylegends.db` for quick one-off dev runs (see `config.py`).

### 3) Run the app
```bash
# Simple run
python run.py

# Flask CLI
export FLASK_APP=run.py            # PowerShell: $env:FLASK_APP="run.py"
export FLASK_ENV=development
flask run
```
Open: `http://127.0.0.1:5000/`

The app at `:5000` serves both HTML pages and a REST API (auth, rooms, lobby chat)
implemented in `app/api.py` and backed by the configured database specified via `DATABASE_URL` (see `docs/dev/api/openapi.yaml`).

## Local mocks

### HTTP mock (port 5002)
```bash
python mocks/api/server.py
```

This mock implements the same REST contract as the main app and is intended **only** for
automated/manual tests or short-lived front-end experiments without touching the real
database. For normal development and any real integration, always use the API exposed by
`python run.py` on `http://127.0.0.1:5000/`.

Endpoints include:
POST /auth/login, POST /auth/register, POST /auth/reset,
GET /rooms, POST /rooms, POST /rooms/{id}/join,
GET/POST /api/chat/{roomId}.

### WebSocket mock (default port 8081)
```bash
# One-time (if ws not installed yet):
npm --prefix mocks install ws

# Run WS mock (recommended shortcut from repo root):
npm run ws:mock

# Or with a custom port:
WS_PORT=9090 npm run ws:mock
```
Emits demo match flow: match_start → turn_start → move_committed → turn_start → afk_warning → technical_loss.

## Testing & CI
- **E2E:** Playwright (local mock app on 127.0.0.1:5001, auto-started by Playwright).
- **CI:** GitHub Actions (.github/workflows/ci.yml) runs smoke tests on push/PR.

### Quick start (local E2E)

```bash
cd tests/e2e
npm ci
npx playwright install

# Run smoke tests
npm test

# Open the HTML report
npx playwright show-report
```

## Configuration
Edit `config.py` or use environment variables:

**Dev/Staging/Prod (recommended):**
  - `DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:5432/citylegends`
  - `REDIS_URL` — reserved for presence/pub-sub when realtime moves to Redis.
  - `SECRET_KEY` — set a strong non-dev value.

## Game summary
- **Card types:** People (engine/VP), Legends (finishers/attacks), Rumors (instants/ongoing), Weather (global), Districts (persistent VP/modifiers).
- **Turn economy:** 2 actions per turn; baseline HP = 5.
- **Contests:** default Opposed 2d6 (+1 per Legend, cap +3).
- **Modes:** Quick (~30 cards, 25 VP or 10 rounds), Classic (~45 cards, 35 VP or 14 rounds).

## SPDX / Licensing notes
This repository is **proprietary**.

- **Code (source):** `LicenseRef-CityLegends-Proprietary-Software`
- **Documentation:** `LicenseRef-CityLegends-Proprietary-Docs`
- **Design & media assets:** `LicenseRef-CityLegends-Proprietary-Assets`

All source/text files include an SPDX header at the top.
Binary or generated files (e.g., .png, .jpg, .svg, .mp4, .pdf, package-lock.json) must have a sibling sidecar file filename.ext.license containing a single line with the respective SPDX identifier.

## Security & access
- Visibility: **Private**. No forks/public mirrors.
- Do not distribute demo builds without written approval.
- Treat all repository contents and discussion as confidential.

## Contact
For permissions or commercial enquiries — contact the maintainers.