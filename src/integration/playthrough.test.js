import { describe, expect, it } from 'vitest';
import { createInitialAppState, reduceApp } from '../app/appState.js';
import { createMetaColumnWinSetup } from '../game/gameLogic.fixtures.js';
import { applyMove } from '../game/gameLogic.js';

function createServices() {
  const storage = new Map();
  const metricsEvents = [];
  return {
    rivalry: {
      storage: {
        get: (key) => storage.get(key) ?? null,
        set: (key, value) => storage.set(key, value),
      },
    },
    metrics: {
      record(type, payload = {}) {
        metricsEvents.push({ type, ...payload });
      },
      events: metricsEvents,
    },
  };
}

describe('playthrough integration', () => {
  it('covers lobby start, terminal win, and rematch', () => {
    const services = createServices();
    let state = createInitialAppState();

    state = reduceApp(state, { type: 'START_MATCH', nameX: 'ALEX', nameO: 'SAM' }, services);
    expect(state.phase).toBe('playing');

    const setup = createMetaColumnWinSetup();
    const winMove = applyMove(setup, { board: 7, cell: 2 });
    state = {
      ...state,
      game: winMove.state,
      phase: 'won',
      outcome: { status: 'won', winner: 'O' },
    };

    state = reduceApp(state, { type: 'REMATCH' }, services);
    expect(state.phase).toBe('playing');
    expect(state.game.moveCount).toBe(0);
    expect(services.metrics.events.filter((e) => e.type === 'match_started').length).toBe(2);
    expect(services.metrics.events.some((e) => e.type === 'rematch_started')).toBe(true);
  });
});
