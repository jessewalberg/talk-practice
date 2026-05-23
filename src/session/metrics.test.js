import { describe, expect, it } from 'vitest';
import { createMetrics } from './metrics.js';

function memoryStorage() {
  const data = new Map();
  return {
    get(key) {
      return data.get(key) ?? null;
    },
    set(key, value) {
      data.set(key, value);
    },
  };
}

describe('createMetrics', () => {
  it('records rivalry return on lobby start (AE5)', () => {
    const metrics = createMetrics(memoryStorage());
    metrics.record('rivalry_return', { pair: 'alex|sam' });
    metrics.record('match_started', { pair: 'alex|sam' });
    expect(metrics.returnRate()).toBe(1);
  });

  it('computes rematch rate after terminal match', () => {
    const metrics = createMetrics(memoryStorage());
    metrics.record('match_started', { sessionId: 's1' });
    metrics.record('match_completed', { sessionId: 's1', outcome: 'win' });
    metrics.record('rematch_started', { sessionId: 's1' });
    expect(metrics.rematchRate()).toBe(1);
  });

  it('splits win completion from terminal resolution', () => {
    const metrics = createMetrics(memoryStorage());
    metrics.record('match_started', {});
    metrics.record('match_completed', { outcome: 'win' });
    metrics.record('match_started', {});
    metrics.record('match_completed', { outcome: 'draw' });
    expect(metrics.winCompletionRate()).toBe(0.5);
    expect(metrics.terminalResolutionRate()).toBe(1);
  });

  it('degrades gracefully when storage throws', () => {
    const metrics = createMetrics({
      get: () => {
        throw new Error('blocked');
      },
      set: () => {
        throw new Error('blocked');
      },
    });
    expect(() => metrics.record('match_started', {})).not.toThrow();
    expect(metrics.events()).toEqual([]);
  });
});
