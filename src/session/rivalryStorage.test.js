import { describe, expect, it } from 'vitest';
import {
  canonicalPairKey,
  createRivalryStorage,
  isReturningPair,
  normalizeName,
  recordLastPlayed,
} from './rivalryStorage.js';

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

describe('normalizeName', () => {
  it('trims, collapses whitespace, and case-folds', () => {
    expect(normalizeName('  Alex   Kim  ')).toBe('alex kim');
  });
});

describe('canonicalPairKey', () => {
  it('matches names regardless of entry order', () => {
    expect(canonicalPairKey('SAM', 'ALEX')).toBe(canonicalPairKey('alex', 'sam'));
  });
});

describe('isReturningPair', () => {
  it('recognizes pair within 168 hours', () => {
    const storage = memoryStorage();
    const rivalry = createRivalryStorage(storage);
    const now = Date.parse('2026-05-22T12:00:00Z');
    recordLastPlayed(rivalry, ['ALEX', 'SAM'], now - 3 * 24 * 60 * 60 * 1000);
    expect(isReturningPair(rivalry, ['SAM', 'Alex'], now)).toBe(true);
  });

  it('does not treat pair outside 168 hours as returning', () => {
    const storage = memoryStorage();
    const rivalry = createRivalryStorage(storage);
    const now = Date.parse('2026-05-22T12:00:00Z');
    recordLastPlayed(rivalry, ['ALEX', 'SAM'], now - 8 * 24 * 60 * 60 * 1000);
    expect(isReturningPair(rivalry, ['ALEX', 'SAM'], now)).toBe(false);
  });
});

describe('storage failures', () => {
  it('degrades gracefully when storage throws', () => {
    const storage = {
      get: () => {
        throw new Error('blocked');
      },
      set: () => {
        throw new Error('blocked');
      },
    };
    const rivalry = createRivalryStorage(storage);
    expect(() => recordLastPlayed(rivalry, ['A', 'B'], Date.now())).not.toThrow();
    expect(isReturningPair(rivalry, ['A', 'B'], Date.now())).toBe(false);
  });
});
