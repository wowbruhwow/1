# City Legends — Project Documentation

Private & Confidential. Do not share outside authorized contributors.  
See license summary at the bottom of this document.

This folder contains all non-code documents used by the team and player-facing references.

## Folder structure

- **description/**  
  Site structure & concept  
  - `CONCEPT.md` — game concept
  - `DETAILED_STRUCTURE.md` — detailed site structure and UI text mapping

- **video/**  
  Internal demo videos and presentations  
  - `VIDEO_PRESENTATION.mov` — short product overview.

- **QA/**  
  Test strategy and assets  
  - `TEST_PLAN.md` — scope, environments, E2E/API/a11y approach.

- **dev/**  
  Developer notes  
  - ABOUT_SCRIPT.md — UI/A11y usage for components (buttons, modals, toast) + dev notes for client-side JS.
  - `api/openapi.yaml` — HTTP API (REST) contract for auth & rooms (real backend + mocks).
  - `api/ws-events.md` — WebSocket events schema & examples for match flow.

- **README.md**  
  This index.

## Player-facing pages on the site

These are public pages rendered by the web app (separate from this docs folder):

- **Rules** — `/info/rules`  
- **Privacy** — `/info/privacy`  
- **License (EULA)** — `/info/license`  
- **Docs** — `/info/docs`

## Tips & conventions

- Keep sensitive data out of docs (no secrets/tokens).  
- For diagrams, export to `.png` or `.svg`; put sources (e.g., draw.io) in the same folder.  
- Prefer small, focused documents; avoid duplicating content that already exists.  
- English is acceptable for technical notes; player-facing texts are primarily **Ukrainian**.  
- (Workflow tip) Use branches like `docs/<short-desc>` and add the `docs` label in MRs.

## Contributing (docs)

- When changing rules, reference the exact section in `game/concept.docx`.  
- Images/videos typically live in `design/…` or `docs/video/` (keep sources next to exports).  
- Link player-facing pages from site routes rather than copying content here.

## License (docs)

All documentation in `docs/` is proprietary to City Legends.  
**SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Docs**  
No copying, modification, redistribution, or public display without prior written consent.  
For questions or permissions, contact the maintainers.