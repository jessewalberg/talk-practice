import { createInitialState } from './gameLogic.js';

function winningCells(player) {
  const cells = Array(9).fill(null);
  cells[0] = player;
  cells[1] = player;
  cells[2] = player;
  return cells;
}

export function createSentToWonBoardSetup() {
  const state = createInitialState();
  state.boards[0] = { cells: winningCells('X'), winner: 'X' };
  state.meta[0] = 'X';
  state.currentPlayer = 'O';
  state.nextBoard = 0;
  state.moveCount = 10;
  return state;
}

export function createMetaColumnWinSetup() {
  const state = createInitialState();
  state.boards[1] = { cells: winningCells('O'), winner: 'O' };
  state.boards[4] = { cells: winningCells('O'), winner: 'O' };
  state.boards[7] = {
    cells: ['O', 'O', null, 'X', 'X', null, null, null, null],
    winner: null,
  };
  state.meta = [null, 'O', null, null, 'O', null, null, null, null];
  state.currentPlayer = 'O';
  state.nextBoard = 7;
  state.moveCount = 40;
  return state;
}
