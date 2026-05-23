import { useMemo, useState } from 'react';
import { useMetaToeApp } from './app/useMetaToeApp.js';
import {
  getActivePlayerName,
  getLegalMovesForUi,
  getTurnBannerClass,
} from './app/appState.js';
import DevMetricsPanel from './dev/DevMetricsPanel.jsx';
import Lobby from './Lobby.jsx';
import GameShell from './components/GameShell.jsx';
import MetaBoard from './components/MetaBoard.jsx';
import MetaMinimap from './components/MetaMinimap.jsx';
import MovesLog from './components/MovesLog.jsx';
import NavBar from './components/NavBar.jsx';
import SidePanel from './components/SidePanel.jsx';
import TerminalMoment from './components/TerminalMoment.jsx';
import TurnBanner from './components/TurnBanner.jsx';
import { isReturningPair } from './session/rivalryStorage.js';
import { playTokenSound } from './sound.js';

function useReducedMotion() {
  return useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
}

function useDevMode() {
  return useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev'),
    [],
  );
}

export default function App() {
  const { state, dispatch, services } = useMetaToeApp();
  const [lobbyNames, setLobbyNames] = useState({ x: '', o: '' });
  const reducedMotion = useReducedMotion();
  const devMode = useDevMode();

  const legalMoves = getLegalMovesForUi(state);
  const welcomeBack =
    lobbyNames.x.trim() &&
    lobbyNames.o.trim() &&
    isReturningPair(services.rivalry, [lobbyNames.x, lobbyNames.o]);

  const opponentName =
    state.game?.currentPlayer === 'X' ? state.names.o : state.names.x;

  function handleStart() {
    dispatch({ type: 'START_MATCH', nameX: lobbyNames.x, nameO: lobbyNames.o });
  }

  function handleCellClick(board, cell) {
    playTokenSound();
    dispatch({ type: 'PLAY_MOVE', board, cell });
  }

  if (state.phase === 'lobby') {
    return (
      <div className="app">
        <NavBar />
        <Lobby
          names={lobbyNames}
          onChange={setLobbyNames}
          onStart={handleStart}
          error={state.feedback}
          welcomeBack={welcomeBack}
        />
        {devMode && <DevMetricsPanel metrics={services.metrics} />}
      </div>
    );
  }

  const statsPanel = (
    <SidePanel title="Stats // live">
      <div className="stat-grid">
        <div className="stat">
          <span className="micro">Moves</span>
          <span className="stat-v">{state.moveCount}</span>
        </div>
        <div className="stat">
          <span className="micro">Phase</span>
          <span className="stat-v">{state.phase}</span>
        </div>
        <div className="stat">
          <span className="micro">Rival X</span>
          <span className="stat-v stat-name">{state.names.x}</span>
        </div>
        <div className="stat">
          <span className="micro">Rival O</span>
          <span className="stat-v stat-name">{state.names.o}</span>
        </div>
      </div>
    </SidePanel>
  );

  const helpPanel = (
    <SidePanel title="Help // pass &amp; play">
      <div className="help">
        <div className="row">
          <span className="num">→</span>
          <span>
            Highlighted local boards are legal targets. Pass the device when the banner switches
            rivals.
          </span>
        </div>
        <div className="row">
          <span className="num">!</span>
          <span>Illegal taps show a banner hint and do not change the board.</span>
        </div>
      </div>
    </SidePanel>
  );

  return (
    <div className="app">
      <NavBar />
      {devMode && <DevMetricsPanel metrics={services.metrics} />}
      <GameShell
        left={statsPanel}
        right={helpPanel}
        center={
          <>
            <TurnBanner
              className={getTurnBannerClass(state)}
              playerName={getActivePlayerName(state)}
              opponentName={opponentName}
              phase={state.phase}
              outcome={state.outcome}
              names={state.names}
            />
            {state.feedback && (
              <p className="move-feedback" role="status">
                {state.feedback}
              </p>
            )}
            <MetaBoard
              game={state.game}
              legalMoves={legalMoves}
              onCellClick={handleCellClick}
              reducedMotion={reducedMotion}
            />
            <MetaMinimap meta={state.game?.meta} />
            <SidePanel title="Moves // log" tight>
              <MovesLog moves={state.moves} />
            </SidePanel>
          </>
        }
      />
      {state.phase === 'won' && (
        <TerminalMoment
          outcome={state.outcome}
          names={state.names}
          onRematch={() => dispatch({ type: 'REMATCH' })}
          onNewSession={() => window.location.reload()}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
