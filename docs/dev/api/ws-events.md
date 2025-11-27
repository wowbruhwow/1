<!-- SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software -->

# WS-події матчів — City Legends

Цей документ описує **схему WS-повідомлень** між клієнтом та сервером для матчу City Legends.
Мок-сервер реалізовано у `mocks/ws-mock.js` і працює разом із HTTP-моком (`mocks/api/server.py`).

## Загальний формат повідомлення

Усі події мають однаковий конверт:

```json
{
  "type": "match_start",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:00:00Z",
  "payload": { "...": "..." }
}
```

- `type` — назва події (див. нижче).
- `matchId` — ідентифікатор матчу (узгоджується з `/play/:matchId` та `wsUrl` з REST API).
- `timestamp` — ISO-8601 UTC час відправлення події.
- `payload` — тіло події, специфічне для кожного типу.

> Напрямок за замовчуванням у цьому документі — **сервер → клієнт**.

## Узагальнені типи

### PlayerShort

Окремий гравець у матчі (спрощений вигляд):

- `id: string` — ідентифікатор гравця.
- `nickname: string` — відображуване ім'я.
- `seat: number` — позиція/слот у матчі (1–4).
- `isYou: boolean` — позначає поточного клієнта.

### TimerInfo

Інформація про таймер ходу:

- `turnNumber: number` — поточний номер ходу.
- `activePlayerId: string` — чий зараз хід.
- `turnEndsAt: string` — ISO-час кінця ходу.
- `remainingTimeSec: number` — залишок часу на момент події.

---

## Перелік подій

Обов'язкові події за ТЗ:

- `match_start`
- `turn_start`
- `move_committed`
- `afk_warning`
- `technical_loss`

Нижче — деталі payload для кожної з них.

---

## match_start

**Напрямок:** сервер → клієнт  
**Коли:** одразу після успішного `POST /rooms/{id}/join` / створення кімнати і старту матчу.

**Payload:**

- `roomId: string` — ідентифікатор кімнати/лобі.
- `mode: "quick" | "classic"` — режим гри (див. CONCEPT.md).
- `turnDurationSec: number` — довжина одного ходу (30 або 45 секунд).
- `players: PlayerShort[]` — гравці в матчі.

**Приклад:**

```json
{
  "type": "match_start",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:00:00Z",
  "payload": {
    "roomId": "1",
    "mode": "quick",
    "turnDurationSec": 30,
    "players": [
      { "id": "p_demo_you", "nickname": "DemoYou", "seat": 1, "isYou": true },
      { "id": "p_demo_opponent", "nickname": "DemoOpponent", "seat": 2, "isYou": false }
    ]
  }
}
```

---

## turn_start

**Напрямок:** сервер → клієнт  
**Коли:** на початку кожного ходу (відповідає відображенню «Ваш хід / Хід суперника» та таймеру).

**Payload (TimerInfo + AFK-дані):**

- `turnNumber: number` — номер ходу, починаючи з 1.
- `activePlayerId: string` — ідентифікатор гравця, який зараз ходить.
- `turnEndsAt: string` — ISO-час кінця ходу.
- `remainingTimeSec: number` — кількість секунд до завершення ходу.
- `afkStrikes?: Record<string, number>` — поточні AFK-страйки по кожному гравцю (необов'язково).

**Приклад:**

```json
{
  "type": "turn_start",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:00:05Z",
  "payload": {
    "turnNumber": 1,
    "activePlayerId": "p_demo_you",
    "turnEndsAt": "2025-01-01T12:00:35Z",
    "remainingTimeSec": 30,
    "afkStrikes": {
      "p_demo_you": 0,
      "p_demo_opponent": 0
    }
  }
}
```

---

## move_committed

**Напрямок:** сервер → клієнт  
**Коли:** після того, як дія гравця (розіграш карти, атака, зміна району, пропуск ходу тощо) остаточно застосована до стану гри.

**Payload (спрощений патч стану):**

- `turnNumber: number` — хід, у межах якого відбулася дія.
- `playerId: string` — хто виконав дію.
- `kind: string` — тип дії (наприклад, `"play_card"`, `"attack"`, `"end_turn"`).
- `summary: string` — короткий текст для логів/чату (людинозрозуміле пояснення).
- `diff: object` — патч стану матчу в зручному для клієнта вигляді (наприклад, зміни HP/VP, дошки, руки).

**Приклад:**

```json
{
  "type": "move_committed",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:00:10Z",
  "payload": {
    "turnNumber": 1,
    "playerId": "p_demo_you",
    "kind": "play_card",
    "summary": "DemoYou грає карту Людини та отримує +1 VP.",
    "diff": {
      "vp": { "p_demo_you": +1 },
      "hand": { "p_demo_you": { "delta": -1 } },
      "board": {
        "p_demo_you": {
          "added": ["card_people_001"]
        }
      }
    }
  }
}
```

> За потреби `diff` можна деталізувати під конкретну реалізацію клієнта; мок повертає мінімально необхідні поля для демо.

---

## afk_warning

**Напрямок:** сервер → клієнт  
**Коли:** гравець **пропустив 2 із 3 останніх ходів** і знаходиться на межі технічної поразки (див. CONCEPT.md / DETAILED_STRUCTURE.md).

**Payload:**

- `playerId: string` — гравець, якому загрожує AFK.
- `strikes: number` — поточна кількість AFK-страйків (зазвичай 2).
- `maxStrikes: number` — поріг для технічної поразки (зазвичай 3).
- `turnsLeftUntilLoss: number` — скільки повних ходів лишилося до технічної поразки.
- `reason: "no_actions" | "disconnect"` — що саме тригерить попередження.

**Приклад:**

```json
{
  "type": "afk_warning",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:01:00Z",
  "payload": {
    "playerId": "p_demo_opponent",
    "strikes": 2,
    "maxStrikes": 3,
    "turnsLeftUntilLoss": 1,
    "reason": "no_actions"
  }
}
```

---

## technical_loss

**Напрямок:** сервер → клієнт  
**Коли:** спрацьовує одна з умов **технічної поразки**:

- 3 із 3 останніх ходів зі страйками AFK;
- гравець не повернувся після disconnect до кінця третього пропущеного ходу;
- добровільна здача («Вийти з матчу» з підтвердженням);
- серйозне порушення/зловживання.

**Payload:**

- `loserId: string` — гравець, який отримав технічну поразку.
- `winnerId?: string` — гравець-переможець (опціонально для FFA/майбутніх режимів).
- `reason: "afk" | "disconnect" | "surrender" | "moderation"` — причина технічної поразки.
- `atTurn: number` — номер ходу, на якому зафіксовано поразку.

**Приклад:**

```json
{
  "type": "technical_loss",
  "matchId": "m_demo_1",
  "timestamp": "2025-01-01T12:01:30Z",
  "payload": {
    "loserId": "p_demo_opponent",
    "winnerId": "p_demo_you",
    "reason": "afk",
    "atTurn": 3
  }
}
```

---

## Підключення до WS-моку

- URL за замовчуванням: `ws://localhost:8081/ws/match/{matchId}?token=dev-token&playerId={playerId}`.
- Мок-сценарій у `mocks/ws-mock.js` автоматично надсилає послідовність подій:
  1. `match_start`
  2. `turn_start` (хід поточного клієнта)
  3. `move_committed` (демо-дія)
  4. `turn_start` (хід опонента)
  5. `afk_warning` → `technical_loss` для опонента.

Ці події узгоджені з REST-відповіддю `wsUrl` у `POST /rooms/{id}/join` (див. `docs/dev/api/openapi.yaml`).
