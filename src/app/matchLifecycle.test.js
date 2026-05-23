import { describe, expect, it } from 'vitest';
import { recordAbandonedMatchIfPlaying } from './matchLifecycle.js';

describe('recordAbandonedMatchIfPlaying', () => {
  it('records abandoned outcome only while playing', () => {
    const events = [];
    const metrics = { record(type, payload) { events.push({ type, ...payload }); } };

    recordAbandonedMatchIfPlaying('lobby', metrics);
    expect(events).toHaveLength(0);

    recordAbandonedMatchIfPlaying('playing', metrics);
    expect(events).toEqual([{ type: 'match_completed', outcome: 'abandoned' }]);

    events.length = 0;
    recordAbandonedMatchIfPlaying('won', metrics);
    expect(events).toHaveLength(0);
  });
});
