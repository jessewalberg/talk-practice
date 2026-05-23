import { describe, expect, it } from 'vitest';
import { validateLobbyNames } from './validateLobby.js';

describe('validateLobbyNames', () => {
  it('accepts two distinct non-empty names', () => {
    expect(validateLobbyNames('ALEX', 'SAM')).toEqual({
      valid: true,
      names: { x: 'ALEX', o: 'SAM' },
    });
  });

  it('rejects empty names', () => {
    expect(validateLobbyNames('ALEX', '   ').valid).toBe(false);
  });

  it('rejects duplicate names', () => {
    expect(validateLobbyNames('Alex', 'alex').valid).toBe(false);
  });

  it('rejects names over 16 characters', () => {
    expect(validateLobbyNames('A'.repeat(17), 'SAM').valid).toBe(false);
  });
});
