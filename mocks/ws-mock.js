// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Простий WS-мок для сценаріїв FE.
// Використовує пакет `ws` (npm install ws).

const { WebSocketServer } = require('ws');
const { URL } = require('url');

const PORT = process.env.WS_PORT || 8081;

const wss = new WebSocketServer({ port: PORT });

console.log(`[ws-mock] Listening on ws://localhost:${PORT}/ws/match/:matchId`);

wss.on('connection', (socket, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.split('/').filter(Boolean);
  const matchId = segments[segments.length - 1] || 'm_demo_1';
  const playerId = url.searchParams.get('playerId') || 'p_demo_you';

  console.log(`[ws-mock] Client connected to matchId=${matchId}, playerId=${playerId}`);

  const send = (type, payload) => {
    const message = {
      type,
      matchId,
      timestamp: new Date().toISOString(),
      payload,
    };
    socket.send(JSON.stringify(message));
  };

  const timers = [];
  const schedule = (delayMs, fn) => {
    const t = setTimeout(fn, delayMs);
    timers.push(t);
  };

  // 1) Початок матчу
  send('match_start', {
    roomId: '1',
    mode: 'quick',
    turnDurationSec: 30,
    players: [
      { id: playerId, nickname: 'DemoYou', seat: 1, isYou: true },
      { id: 'p_demo_opponent', nickname: 'DemoOpponent', seat: 2, isYou: false },
    ],
  });

  let turnNumber = 1;

  // 2) Старт ходу поточного клієнта
  schedule(1000, () => {
    send('turn_start', {
      turnNumber,
      activePlayerId: playerId,
      turnEndsAt: new Date(Date.now() + 30000).toISOString(),
      remainingTimeSec: 30,
      afkStrikes: {
        [playerId]: 0,
        p_demo_opponent: 0,
      },
    });
  });

  // 3) Коміт ходу (демо-дія)
  schedule(4000, () => {
    send('move_committed', {
      turnNumber,
      playerId,
      kind: 'play_card',
      summary: 'DemoYou грає карту Людини та отримує +1 VP.',
      diff: {
        vp: { [playerId]: +1 },
        hand: { [playerId]: { delta: -1 } },
        board: {
          [playerId]: {
            added: ['card_people_001'],
          },
        },
      },
    });
  });

  // 4) Старт ходу опонента
  schedule(8000, () => {
    turnNumber += 1;
    send('turn_start', {
      turnNumber,
      activePlayerId: 'p_demo_opponent',
      turnEndsAt: new Date(Date.now() + 30000).toISOString(),
      remainingTimeSec: 30,
      afkStrikes: {
        [playerId]: 0,
        p_demo_opponent: 2,
      },
    });
  });

  // 5) AFK-попередження для опонента
  schedule(15000, () => {
    send('afk_warning', {
      playerId: 'p_demo_opponent',
      strikes: 2,
      maxStrikes: 3,
      turnsLeftUntilLoss: 1,
      reason: 'no_actions',
    });
  });

  // 6) Технічна поразка опонента
  schedule(22000, () => {
    send('technical_loss', {
      loserId: 'p_demo_opponent',
      winnerId: playerId,
      reason: 'afk',
      atTurn: turnNumber + 1,
    });
  });

  socket.on('message', (data) => {
    // Для дебагу можна відправляти будь-які клієнтські події,
    // мок їх просто логує.
    try {
      const msg = JSON.parse(data.toString());
      console.log('[ws-mock] client message:', msg);
    } catch {
      console.log('[ws-mock] client message (raw):', data.toString());
    }
  });

  socket.on('close', () => {
    timers.forEach(clearTimeout);
    console.log(`[ws-mock] Client disconnected from matchId=${matchId}`);
  });
});
