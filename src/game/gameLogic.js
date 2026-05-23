const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createInitialState() {
  return {
    boards: Array.from({ length: 9 }, () => ({
      cells: Array(9).fill(null),
      winner: null,
    })),
    meta: Array(9).fill(null),
    currentPlayer: 'X',
    nextBoard: null,
    moveCount: 0,
    status: 'playing',
    winner: null,
  };
}

export function getResult(state) {
  if (state.status === 'won') {
    return { status: 'won', winner: state.winner };
  }
  if (state.status === 'draw') {
    return { status: 'draw', winner: null };
  }

  const metaWinner = getMetaWinner(state.meta);
  if (metaWinner) {
    return { status: 'won', winner: metaWinner };
  }

  if (getLegalMoves(state).length === 0) {
    return { status: 'draw', winner: null };
  }

  return { status: 'playing', winner: null };
}

export function getLegalMoves(state) {
  if (state.status !== 'playing') {
    return [];
  }

  const targetBoards = getTargetBoardIndices(state);
  const moves = [];

  for (const boardIndex of targetBoards) {
    const board = state.boards[boardIndex];
    if (board.winner) continue;

    board.cells.forEach((cell, cellIndex) => {
      if (!cell) {
        moves.push({ board: boardIndex, cell: cellIndex });
      }
    });
  }

  return moves;
}

export function applyMove(state, { board, cell }) {
  if (state.status !== 'playing') {
    return { ok: false, error: 'terminal', state };
  }

  const legal = getLegalMoves(state);
  const isLegal = legal.some((m) => m.board === board && m.cell === cell);
  if (!isLegal) {
    return { ok: false, error: 'illegal', state };
  }

  const next = cloneState(state);
  const boardState = next.boards[board];
  boardState.cells[cell] = next.currentPlayer;

  if (!boardState.winner) {
    const localWinner = getLocalWinner(boardState.cells);
    if (localWinner) {
      boardState.winner = localWinner;
      next.meta[board] = localWinner;
    }
  }

  const metaWinner = getMetaWinner(next.meta);
  if (metaWinner) {
    next.status = 'won';
    next.winner = metaWinner;
    next.moveCount += 1;
    return { ok: true, state: next };
  }

  const sentToBoard = cell;
  next.nextBoard = isBoardPlayable(next, sentToBoard) ? sentToBoard : null;
  next.currentPlayer = next.currentPlayer === 'X' ? 'O' : 'X';
  next.moveCount += 1;

  if (getLegalMoves(next).length === 0) {
    next.status = 'draw';
    next.winner = null;
  }

  return { ok: true, state: next };
}

function getTargetBoardIndices(state) {
  if (state.moveCount === 0 || state.nextBoard === null) {
    return state.boards
      .map((_, index) => index)
      .filter((index) => isBoardPlayable(state, index));
  }

  if (isBoardPlayable(state, state.nextBoard)) {
    return [state.nextBoard];
  }

  return state.boards
    .map((_, index) => index)
    .filter((index) => isBoardPlayable(state, index));
}

function isBoardPlayable(state, boardIndex) {
  const board = state.boards[boardIndex];
  if (board.winner) return false;
  return board.cells.some((cell) => !cell);
}

function getLocalWinner(cells) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return cells[a];
    }
  }

  if (cells.every(Boolean)) {
    return 'draw';
  }

  return null;
}

function getMetaWinner(meta) {
  for (const line of LINES) {
    const [a, b, c] = line;
    const v = meta[a];
    if (v && v !== 'draw' && v === meta[b] && v === meta[c]) {
      return v;
    }
  }
  return null;
}

function cloneState(state) {
  return {
    ...state,
    boards: state.boards.map((board) => ({
      ...board,
      cells: [...board.cells],
    })),
    meta: [...state.meta],
  };
}
