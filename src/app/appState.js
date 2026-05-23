import { createInitialState, applyMove, getResult, getLegalMoves } from '../game/gameLogic.js';
import { validateLobbyNames } from '../lobby/validateLobby.js';
import { canonicalPairKey, isReturningPair, recordLastPlayed } from '../session/rivalryStorage.js';

export function createInitialAppState() {
  return {
    phase: 'lobby',
    names: { x: '', o: '' },
    game: null,
    moves: [],
    feedback: null,
    moveCount: 0,
  };
}

export function reduceApp(state, action, services) {
  switch (action.type) {
    case 'SET_LOBBY_NAMES':
      return { ...state, names: action.names, feedback: null };
    case 'START_MATCH': {
      const validation = validateLobbyNames(action.nameX, action.nameO);
      if (!validation.valid) {
        return { ...state, feedback: validation.error };
      }
      const names = validation.names;
      if (isReturningPair(services.rivalry, [names.x, names.o])) {
        services.metrics.record('rivalry_return', { pair: canonicalPairKey(names.x, names.o) });
      }
      services.metrics.record('match_started', { pair: canonicalPairKey(names.x, names.o) });
      return {
        phase: 'playing',
        names,
        game: createInitialState(),
        moves: [],
        feedback: null,
        moveCount: 0,
      };
    }
    case 'PLAY_MOVE': {
      if (state.phase !== 'playing' || !state.game) return state;
      const result = applyMove(state.game, { board: action.board, cell: action.cell });
      if (!result.ok) {
        return { ...state, feedback: 'Illegal move — check the active board.' };
      }
      const game = result.state;
      const moveCount = state.moveCount + 1;
      const player = state.game.currentPlayer;
      const moves = [
        ...state.moves,
        {
          n: moveCount,
          player,
          desc: `Board ${action.board + 1} · cell ${action.cell + 1}`,
        },
      ];
      const outcome = getResult(game);
      if (outcome.status === 'won' || outcome.status === 'draw') {
        services.metrics.record('match_completed', { outcome: outcome.status === 'won' ? 'win' : 'draw' });
        recordLastPlayed(services.rivalry, [state.names.x, state.names.o]);
        return {
          ...state,
          phase: 'won',
          game,
          moves,
          feedback: null,
          moveCount,
          outcome,
        };
      }
      return { ...state, game, moves, feedback: null, moveCount };
    }
    case 'REMATCH': {
      if (state.phase !== 'won') return state;
      services.metrics.record('rematch_started', { pair: canonicalPairKey(state.names.x, state.names.o) });
      services.metrics.record('match_started', { pair: canonicalPairKey(state.names.x, state.names.o) });
      return {
        ...state,
        phase: 'playing',
        game: createInitialState(),
        moves: [],
        feedback: null,
        moveCount: 0,
        outcome: null,
      };
    }
    default:
      return state;
  }
}

export function getActivePlayerName(state) {
  if (!state.game) return '';
  return state.game.currentPlayer === 'X' ? state.names.x : state.names.o;
}

export function getLegalMovesForUi(state) {
  if (!state.game || state.phase !== 'playing') return [];
  return getLegalMoves(state.game);
}

export function getTurnBannerClass(state) {
  if (state.phase === 'won') {
    return 'turn-banner done';
  }
  if (!state.game) return 'turn-banner';
  return state.game.currentPlayer === 'X' ? 'turn-banner x' : 'turn-banner o';
}
