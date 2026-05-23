import tokenO from '../../design-system/assets/token-o.svg';
import tokenX from '../../design-system/assets/token-x.svg';

export default function MetaBoard({ game, legalMoves, onCellClick, reducedMotion }) {
  if (!game) return null;

  const legalBoards = new Set(legalMoves.map((m) => m.board));
  const legalCells = new Set(legalMoves.map((m) => `${m.board}-${m.cell}`));
  const forcedBoard = legalBoards.size === 1 ? [...legalBoards][0] : null;

  return (
    <div className="meta-board" role="grid" aria-label="Ultimate tic tac toe board">
      {game.boards.map((board, boardIndex) => {
        const boardLegal = legalBoards.has(boardIndex);
        const classes = ['local-board'];
        if (board.winner === 'X') classes.push('won-x');
        else if (board.winner === 'O') classes.push('won-o');
        else if (board.winner === 'draw') classes.push('won-draw');
        else if (boardLegal) classes.push(forcedBoard === boardIndex ? 'active forced' : 'active');
        else if (legalMoves.length > 0) classes.push('dim');

        return (
          <div key={boardIndex} className={classes.join(' ')} role="rowgroup">
            {board.cells.map((cell, cellIndex) => {
              const key = `${boardIndex}-${cellIndex}`;
              const clickable = legalCells.has(key);
              return (
                <button
                  key={cellIndex}
                  type="button"
                  className={`cell${clickable ? ' playable' : ''}`}
                  disabled={!clickable || Boolean(cell)}
                  onClick={() => onCellClick(boardIndex, cellIndex)}
                  aria-label={`Board ${boardIndex + 1} cell ${cellIndex + 1}`}
                >
                  {cell === 'X' && (
                    <img
                      className={reducedMotion ? 'token' : 'token snap'}
                      src={tokenX}
                      alt="X"
                    />
                  )}
                  {cell === 'O' && (
                    <img
                      className={reducedMotion ? 'token' : 'token snap'}
                      src={tokenO}
                      alt="O"
                    />
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
