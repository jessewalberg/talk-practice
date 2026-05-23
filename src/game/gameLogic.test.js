import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createInitialState,
  getLegalMoves,
  getResult,
} from './gameLogic.js';
import { createMetaColumnWinSetup, createSentToWonBoardSetup } from './gameLogic.fixtures.js';

function play(state, board, cell) {
  const result = applyMove(state, { board, cell });
  expect(result.ok, result.error).toBe(true);
  return result.state;
}

describe('createInitialState', () => {
  it('starts with X to move and free board choice', () => {
    const state = createInitialState();
    expect(state.currentPlayer).toBe('X');
    expect(getResult(state).status).toBe('playing');
    const moves = getLegalMoves(state);
    expect(moves.length).toBeGreaterThan(0);
    expect(new Set(moves.map((m) => m.board)).size).toBeGreaterThan(1);
  });
});

describe('opening move', () => {
  it('allows first move in any local board', () => {
    const state = createInitialState();
    const result = applyMove(state, { board: 4, cell: 4 });
    expect(result.ok).toBe(true);
    expect(result.state.currentPlayer).toBe('O');
    expect(result.state.nextBoard).toBe(4);
  });
});

describe('AE1 — illegal board when sent-to is open', () => {
  it('rejects move on wrong local board and leaves state unchanged', () => {
    let state = createInitialState();
    state = play(state, 0, 0);
    const wrongBoard = applyMove(state, { board: 1, cell: 0 });
    expect(wrongBoard.ok).toBe(false);
    expect(wrongBoard.state).toBe(state);
    expect(getLegalMoves(state).every((m) => m.board === 0)).toBe(true);
  });
});

describe('AE2 — free move when sent-to board is won', () => {
  it('allows any open local board when sent-to is already won', () => {
    const state = createSentToWonBoardSetup();
    expect(state.boards[0].winner).toBe('X');
    expect(state.nextBoard).toBe(0);
    const boards = new Set(getLegalMoves(state).map((m) => m.board));
    expect(boards.size).toBeGreaterThan(1);
    expect(boards.has(0)).toBe(false);
    const result = applyMove(state, { board: 3, cell: 0 });
    expect(result.ok).toBe(true);
  });
});

describe('AE3 — meta win on third local column win', () => {
  it('ends match immediately when O completes center meta column', () => {
    const state = createMetaColumnWinSetup();
    const result = applyMove(state, { board: 7, cell: 2 });
    expect(result.ok).toBe(true);
    expect(getResult(result.state)).toEqual({ status: 'won', winner: 'O' });
  });
});

describe('occupied cell', () => {
  it('rejects playing on an occupied cell', () => {
    let state = createInitialState();
    state = play(state, 2, 2);
    const result = applyMove(state, { board: 2, cell: 2 });
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
  });
});

describe('terminal state', () => {
  it('rejects moves after match is won', () => {
    const setup = createMetaColumnWinSetup();
    const won = applyMove(setup, { board: 7, cell: 2 }).state;
    expect(getResult(won).status).toBe('won');
    const result = applyMove(won, { board: 8, cell: 0 });
    expect(result.ok).toBe(false);
  });
});

describe('match draw', () => {
  it('detects draw when meta grid cannot produce a line', () => {
    const state = createDrawState();
    expect(getResult(state)).toEqual({ status: 'draw', winner: null });
    expect(getLegalMoves(state)).toHaveLength(0);
  });
});

/** Known drawn position (classic UTTT draw setup). */
function createDrawState() {
  const cellsByBoard = [
    ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'],
    ['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'],
    ['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'],
    ['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'X'],
    ['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'],
    ['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'X'],
  ];
  const boards = cellsByBoard.map((cells) => ({
    cells: cells.map((p) => p),
    winner: resolveLocalWinner(cells),
  }));
  const meta = boards.map((b) => b.winner ?? 'draw');
  return {
    boards,
    meta,
    currentPlayer: 'X',
    nextBoard: null,
    moveCount: 81,
    status: 'draw',
    winner: null,
  };
}

function resolveLocalWinner(cells) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return cells[a];
    }
  }
  if (cells.every(Boolean)) return 'draw';
  return null;
}
