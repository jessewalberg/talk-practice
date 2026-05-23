export default function Lobby({ names, onChange, onStart, error, welcomeBack }) {
  const canStart = names.x.trim() && names.o.trim();

  return (
    <div className="lobby">
      <div className="lobby-frame">
        <div className="lobby-head">
          <span>Session // lobby</span>
          <span>Ultimate</span>
        </div>
        <div className="lobby-body">
          <h1 className="lobby-h1">
            Meta<span className="x">X</span>
            <span className="o">O</span>
            <span className="cursor" aria-hidden="true" />
          </h1>
          <p className="lobby-p">
            Enter rival names, start the match, and pass the device each turn. Rematch keeps the
            same pairing — reload for new rivals.
          </p>
          {welcomeBack && (
            <p className="lobby-welcome" role="status">
              Welcome back — this rivalry pair played within the last 7 days.
            </p>
          )}
          <div className="lobby-section">
            <div className="lobby-label">Rivals</div>
            <div className="name-row">
              <div className="name-field x">
                <label htmlFor="rival-x">Rival X</label>
                <input
                  id="rival-x"
                  className="name-input x"
                  value={names.x}
                  maxLength={16}
                  placeholder="NAME"
                  onChange={(e) => onChange({ ...names, x: e.target.value })}
                />
              </div>
              <div className="name-field o">
                <label htmlFor="rival-o">Rival O</label>
                <input
                  id="rival-o"
                  className="name-input o"
                  value={names.o}
                  maxLength={16}
                  placeholder="NAME"
                  onChange={(e) => onChange({ ...names, o: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="lobby-actions">
            <button
              type="button"
              className="mt-btn primary"
              disabled={!canStart}
              onClick={onStart}
            >
              Start match
            </button>
            <span className="lobby-hint">Left = X · Right = O</span>
          </div>
          {error && (
            <p className="lobby-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="lobby-rules">
        <div className="lobby-rules-head">
          <span>Rules // ultimate</span>
          <span>9× nested</span>
        </div>
        <div className="lobby-rules-body">
          <div className="rules-row">
            <span className="rules-n">01</span>
            <span>
              Your move sends the rival to the matching <b>local board</b>.
            </span>
          </div>
          <div className="rules-row">
            <span className="rules-n">02</span>
            <span>
              Win a local board to claim that <b>meta cell</b>.
            </span>
          </div>
          <div className="rules-row">
            <span className="rules-n">03</span>
            <span>
              If the sent-to board is closed, play anywhere with open cells.
            </span>
          </div>
          <div className="rules-row">
            <span className="rules-n">04</span>
            <span>
              Three meta cells in a row wins the <b>match</b>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
