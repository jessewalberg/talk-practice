const CONFETTI_COLORS = ['var(--magenta)', 'var(--cyan)', 'var(--amber)', 'var(--fg-soft)'];

const CONFETTI_PIECES = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 17) % 100}%`,
  animationDelay: `${(index % 8) * 0.12}s`,
  background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

export default function TerminalMoment({
  outcome,
  names,
  onRematch,
  onNewSession,
  reducedMotion = false,
}) {
  const draw = outcome?.status === 'draw';
  const winnerName = outcome?.winner === 'X' ? names.x : names.o;
  const showConfetti = !draw && !reducedMotion;

  return (
    <div className="terminal-overlay" role="dialog" aria-modal="true" aria-labelledby="terminal-title">
      {showConfetti && (
        <div className="terminal-confetti" aria-hidden="true">
          {CONFETTI_PIECES.map((style, index) => (
            <span key={index} className="confetti-piece" style={style} />
          ))}
        </div>
      )}
      <div className="terminal-panel">
        <p className="micro terminal-kicker">{draw ? 'Stalemate' : 'Decisive'}</p>
        <h2 id="terminal-title" className="terminal-title">
          {draw ? 'Draw' : `${winnerName} wins`}
        </h2>
        <p className="terminal-copy">
          {draw
            ? 'The meta grid locked with no line — settle it with a rematch.'
            : 'The rivalry continues. Same names, fresh board.'}
        </p>
        <div className="footer-actions">
          <button type="button" className="mt-btn primary" onClick={onRematch}>
            Rematch
          </button>
          <button
            type="button"
            className="mt-btn"
            data-hover-shadow="var(--fg-3)"
            onClick={onNewSession}
          >
            New session
          </button>
        </div>
      </div>
    </div>
  );
}
