export default function GameShell({ left, center, right }) {
  return (
    <div className="game-layout">
      <div className="side-col">{left}</div>
      <div className="center-stack">{center}</div>
      <div className="side-col">{right}</div>
    </div>
  );
}
