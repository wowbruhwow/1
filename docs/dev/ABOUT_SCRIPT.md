<!-- SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software -->
# ABOUT_SCRIPT.md — UI / A11y usage (short)

## Підключення
```html
<link href="/static/css/style.css" rel="stylesheet">
<script src="/static/js/ui.js" defer></script>
```
> `defer` гарантує, що делеговані слухачі у `ui.js` спрацюють після парсингу DOM.

## Токени й утиліти (CSS)
- Токени кольорів/типографіки/spacing/тіней оголошені в `:root` (див. `style.css`). Вони живлять компоненти через CSS‑змінні (`--cta`, `--surface`, `--text-on-dark`, `--radius`, ін.).
- Фокус‑кільце глобальне: `:focus-visible { box-shadow: var(--focus-ring) }` — відповідає A11y.
- Класи‑утиліти: `.surface`, `.card`, `.panel`, розміри кнопок `.btn--s|m|l`.

## Компоненти
### Button
- База: `.btn` + варіанти (`.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`, `.btn--icon`, `.btn--toggle`).
- **Toggle**: використовуйте `aria-pressed="true|false"` на `.btn--toggle`. Слухач у `ui.js` перемикає стан (клік + (рекомендовано) Space/Enter).
- **Loading**: додайте `data-loading-on-click` і, за потреби, `data-loading-time="1200"`.

### Input
- Клас `.input`, видимий `:focus-visible`. Для валідації пароля — `data-validate="password"` + `data-error-target="#id"`.

### Modal
- Оболонка на сторінці: один `<div class="overlay" hidden></div>` + один `<div class="modal-wrap" hidden>…</div>`.
- Кожна модалка: `<div id="m1" class="modal …" role="dialog" aria-labelledby="…" aria-describedby="…" hidden>…</div>`.
- Тригери: `data-open-modal="#m1"` / `data-close-modal`. Є **focus trap**, `Esc` закриває, фокус повертається до тригера.

### Toast
- Контейнер: `<div id="app-toast" class="toast" role="status" aria-live="polite" hidden></div>`. Не отримує фокус.

## Адаптив / брейкпойнти
- Компоненти не ламають потік; сітки/розкладку зробіть у сторінкових шаблонах Home/Auth/Lobby (приклади в демо).
- Макети розраховані **лише на десктопні розширення екрана**; окремі мобільні/планшетні версії не підтримуються.
- Мінімальні інтерактивні розміри дотримані (44×44).

---

## Deliverables / AC (швидкий чеклист)
- **Tokens + /ui-preview**: сторінка з усіма компонентами (або секція в демо).
- **Lighthouse ≥ 90 (Desktop)** на Home/Auth (meta viewport як технічна вимога, семантичні заголовки/ландмарки, видимий фокус, швидкий рендер; мобільні девайси поза скоупом).
- **Фокус видимий** на всіх інтерактивних; **контраст ≥ 4.5:1** для тексту.
- **Modals**: `role="dialog"`, **focus trap**, **Esc** закриває, **клік по overlay** закриває, **повернення фокуса**.
- **Toast**: `role="status"`, `aria-live="polite"`, **не краде фокус**.
- **Docs**: цей файл (1–2 екрани) з короткими інструкціями.

## Приклади включення partials
Якщо є шаблонізатор:
```jinja2
{% include 'partials/button.html' %}
{% include 'partials/input.html' %}
{% include 'partials/card.html' %}
{% include 'partials/modal.html' %}  {# конкретне модальне вікно #}
{% include 'partials/toast.html' %}         {# один раз на сторінку #}
```
Або просто скопіюйте HTML-фрагменти на сторінку.

---

## Моки API/WS (для тестування)

### HTTP-мок (REST)

- **Основний бекенд:** `run.py` + `app/api.py` (Flask, порт 5000) реалізує реальний REST API
  для авторизації, лобі/кімнат та чату лобі з використанням БД (див. `docs/dev/api/openapi.yaml`).
- **HTTP-мок:** `mocks/api/server.py` (Flask, порт 5002) — легкий in-memory сервер,
-  який використовується переважно в Playwright/QA-тестах та для ізольованих FE-експериментів
-  без підключення до реальної БД. У звичайній розробці клієнт має працювати проти основного
-  бекенду на порті 5000.
- Запуск HTTP-моку із кореня репозиторію:
  - Активуйте Python-віртуалку цього проєкту.
  - Встановіть залежності `pip install -r requirements.txt` (якщо ще не встановлені).
  - Запустіть сервер:
    - `python mocks/api/server.py`
- Ендпоїнти (контракт описано в `docs/dev/api/openapi.yaml`):
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/reset`
  - `GET /rooms`
  - `POST /rooms`
  - `POST /rooms/{id}/join`
  - `GET /api/chat/{roomId}`
  - `POST /api/chat/{roomId}`

### WS-мок (події матчу)

- Сервер: `mocks/ws-mock.js` (Node + `ws`, порт 8081).
- Разова установка залежностей (з кореня репозиторію):
  - `npm --prefix mocks install ws`
- Запуск WS-сервера (з кореня репозиторію):
  - `npm run ws:mock`
  - або з кастомним портом: `WS_PORT=9090 npm run ws:mock`
- Підключення з клієнта (приклад):
  - `new WebSocket('ws://localhost:8081/ws/match/demo-match?token=dev-token&playerId=p_demo_you')`
- Сценарій моку надсилає послідовність подій (див. `docs/dev/api/ws-events.md`):
  1. `match_start`
  2. `turn_start`
  3. `move_committed`
  4. `afk_warning`
  5. `technical_loss`

### Браузерний WS-клієнт (reconnect + heartbeat)

- Файл: `app/static/js/ws-client.js`.
- Експортує глобальний конструктор `window.CityLegendsWsClient`.
- Підтримує:
  - автоматичний reconnection з експоненційним backoff;
  - heartbeat (JSON `{ type: 'ping' }` з інтервалом `heartbeatIntervalMs`);
  - автоматичний `JSON.parse` повідомлень та callback `onEvent`.
- Приклад використання (на сторінці з матчем):

```js
const client = new CityLegendsWsClient('ws://localhost:8081/ws/match/m_demo_1?token=dev-token&playerId=p_demo_you', {
  heartbeatIntervalMs: 15000,
  debug: true,
  onEvent(event) {
    // event: { type, matchId, timestamp, payload }
    console.log('[WS EVENT]', event.type, event.payload);
  },
  onOpen() {
    console.log('[WS] connected');
  },
  onClose(info) {
    console.log('[WS] closed', info);
  },
});

client.connect();
```
