export default function MovesLog({ moves }) {
  return (
    <div className="moves">
      {moves.length === 0 ? (
        <div className="moves-empty">Moves appear here once the match starts.</div>
      ) : (
        moves.map((move) => (
          <div key={move.n} className={`move-row ${move.player}`}>
            <span className="n">{String(move.n).padStart(2, '0')}</span>
            <span className="sym">{move.player}</span>
            <span className="desc">{move.desc}</span>
          </div>
        ))
      )}
    </div>
  );
}
