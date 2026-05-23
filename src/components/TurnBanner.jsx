export default function TurnBanner({ className, playerName, opponentName, phase, outcome, names }) {
  if (phase === 'won') {
    const draw = outcome?.status === 'draw';
    return (
      <div className={className}>
        <span className="prompt">{draw ? '◆' : '★'}</span>
        <span className="player">
          {draw ? 'Draw — no decisive winner' : `${outcome?.winner === 'X' ? names.x : names.o} wins`}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="prompt">▶</span>
      <span className={`player ${className.includes(' x') ? 'x' : 'o'}`}>{playerName}</span>
      <span className="hint">pass to {opponentName || 'rival'}</span>
    </div>
  );
}
