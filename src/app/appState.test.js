import { describe, expect, it } from 'vitest';
import { createInitialAppState, reduceApp } from './appState.js';
import { createMetaColumnWinSetup } from '../game/gameLogic.fixtures.js';

function memoryStorage() {
  const data = new Map();
  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => data.set(key, value),
  };
}

function createServices() {
  const storage = memoryStorage();
  return {
    rivalry: { storage },
    metrics: {
      events: [],
      record(type, payload) {
        this.events.push({ type, ...payload });
      },
    },
  };
}

describe('reduceApp', () => {
  it('starts a match with valid lobby names', () => {
    const services = createServices();
    const next = reduceApp(createInitialAppState(), {
      type: 'START_MATCH',
      nameX: 'ALEX',
      nameO: 'SAM',
    }, services);
    expect(next.phase).toBe('playing');
    expect(next.names).toEqual({ x: 'ALEX', o: 'SAM' });
    expect(services.metrics.events.some((e) => e.type === 'match_started')).toBe(true);
  });

  it('rejects duplicate lobby names', () => {
    const services = createServices();
    const next = reduceApp(createInitialAppState(), {
      type: 'START_MATCH',
      nameX: 'Alex',
      nameO: 'alex',
    }, services);
    expect(next.phase).toBe('lobby');
    expect(next.feedback).toMatch(/different names/i);
  });

  it('PLAY_MOVE completes match and records match_completed', () => {
    const services = createServices();
    let state = reduceApp(createInitialAppState(), {
      type: 'START_MATCH',
      nameX: 'ALEX',
      nameO: 'SAM',
    }, services);
    state = { ...state, game: createMetaColumnWinSetup() };
    state = reduceApp(state, { type: 'PLAY_MOVE', board: 7, cell: 2 }, services);
    expect(state.phase).toBe('won');
    expect(state.outcome).toEqual({ status: 'won', winner: 'O' });
    expect(
      services.metrics.events.some(
        (e) => e.type === 'match_completed' && e.outcome === 'win',
      ),
    ).toBe(true);
  });

  it('rematch keeps names and resets board', () => {
    const services = createServices();
    let state = reduceApp(createInitialAppState(), {
      type: 'START_MATCH',
      nameX: 'ALEX',
      nameO: 'SAM',
    }, services);
    state = {
      ...state,
      phase: 'won',
      outcome: { status: 'won', winner: 'X' },
    };
    const next = reduceApp(state, { type: 'REMATCH' }, services);
    expect(next.phase).toBe('playing');
    expect(next.names).toEqual({ x: 'ALEX', o: 'SAM' });
    expect(next.game.moveCount).toBe(0);
    expect(services.metrics.events.some((e) => e.type === 'rematch_started')).toBe(true);
  });
});
