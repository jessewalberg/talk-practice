export default function MetaMinimap({ meta }) {
  if (!meta) return null;

  return (
    <div className="meta-mini-wrap">
      <div className="meta-mini" aria-label="Meta board state">
        {meta.map((value, index) => (
          <div
            key={index}
            className={`meta-mini-cell${value === 'X' ? ' x' : value === 'O' ? ' o' : value === 'draw' ? ' draw' : ''}`}
          >
            {value === 'X' ? 'X' : value === 'O' ? 'O' : value === 'draw' ? '·' : ''}
          </div>
        ))}
      </div>
      <div className="legend">
        <span>
          <span className="lg-sq lg-active" /> Active
        </span>
        <span>
          <span className="lg-sq" /> Open
        </span>
      </div>
    </div>
  );
}
