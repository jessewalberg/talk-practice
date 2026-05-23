---
title: MetaToe playable MVP layered architecture
date: 2026-05-22
category: architecture-patterns
module: metatoe-mvp
problem_type: architecture_pattern
component: testing_framework
severity: medium
applies_when:
  - "Greenfield Vite+React app consuming an existing design-system/ reference in the same repo"
  - "Game or rules-heavy UI where pure logic must stay testable without DOM"
  - "Pass-and-play local MVP needing lobby → play → terminal → rematch flow"
  - "Browser-local rivalry memory and session metrics without a backend"
related_components:
  - tooling
  - development_workflow
  - documentation
tags:
  - metatoe
  - vite-react-vitest
  - pure-game-logic
  - phase-reducer
  - localstorage-metrics
  - design-system-port
  - tdd-fixtures
  - conventional-commits
---

# MetaToe playable MVP layered architecture

## Context

MetaToe is a **pass-and-play ultimate tic tac toe** MVP: two rivals on one device, lobby names → match → terminal (win or draw) → rematch, with local rivalry memory and session metrics. The implementation shipped on branch `feat/metatoe-playable-mvp` ([PR #1](https://github.com/jessewalberg/talk-practice/pull/1)) after a full CE pipeline in one session (session history).

| Stage | Artifact |
|-------|----------|
| Strategy | `STRATEGY.md` — match completion, rematch, 7-day return |
| Brainstorm | `docs/brainstorms/2026-05-22-metatoe-mvp-playable-requirements.md` — R1–R13 |
| Plan | `docs/plans/2026-05-22-001-feat-metatoe-mvp-playable-plan.md` — U1–U6 |
| ADR | `docs/decisions/ADR-0001-vite-app-at-repo-root.md` |
| Build | TDD units: scaffold → game → session → app |
| Review | `/ce-code-review` — six findings applied (28 tests green) |
| Ship | Docs-only `main` + feature branch for reviewable PR diff |

**Stack:** Vite 6, React 18, Vitest 2 (`environment: 'node'`). Design source: `design-system/MetaToe.html` + `design-system/styles/colors_and_type.css`.

## Guidance

### Layering

```
UI components (Lobby, MetaBoard, TerminalMoment)
        ↓ dispatch
appState.js reducer (lobby | playing | won)
        ↓ calls
gameLogic.js (pure rules)     session/* (rivalry + metrics, injectable storage)
```

Keep **rules out of React**. The UI only dispatches `START_MATCH`, `PLAY_MOVE`, and `REMATCH`; the reducer owns phase transitions and metrics side effects.

### Pure `gameLogic`

`src/game/gameLogic.js` exports four functions:

- `createInitialState()` — nine local boards, meta grid, sent-to (`nextBoard`)
- `getLegalMoves(state)` — opening free boards; sent-to constraint; fallback when sent-to board is won/full
- `applyMove(state, { board, cell })` — `{ ok, error?, state }`; immutable updates
- `getResult(state)` — `playing` | `won` | `draw`

Meta wins ignore `'draw'` cells on the meta grid. Local draws block meta lines but do not end the match until no legal moves remain.

### Phase machine + hook

`src/app/appState.js` — `reduceApp(state, action, services)` with injectable `services.rivalry` and `services.metrics`.

`src/app/useMetaToeApp.js` wires `useReducer`, memoized services, and a `pagehide` listener for abandoned matches (R11).

### Abandoned matches (R11)

`src/app/matchLifecycle.js` isolates unload logic:

```javascript
export function recordAbandonedMatchIfPlaying(phase, metrics) {
  if (phase === 'playing') {
    metrics.record('match_completed', { outcome: 'abandoned' });
  }
}
```

Only `playing` emits abandoned; `won`/`lobby` do not double-count. Prefer `pagehide` over `beforeunload` alone for terminal bookkeeping.

### Metrics: two completion rates

`src/session/metrics.js` — append-only events in `localStorage` key `metatoe/metrics/events`.

| Rate | Numerator | Denominator | Purpose |
|------|-----------|-------------|---------|
| `terminalResolutionRate()` | any `match_completed` (win, draw, abandoned) | `match_started` | Session bookkeeping / R11 |
| `winCompletionRate()` | `match_completed` where `outcome === 'win'` | `match_started` | **STRATEGY** match completion rate |

Event types: `match_started`, `match_completed`, `rematch_started`, `rivalry_return`.

Draw is terminal and rematch-eligible. **Abandoned** counts for instrumentation only — not a strategy metric.

### Test fixtures boundary

Acceptance setups that are awkward to reach with short `play()` chains live in `src/game/gameLogic.fixtures.js`:

- `createSentToWonBoardSetup()` — AE2: sent-to board already won; player may play elsewhere
- `createMetaColumnWinSetup()` — AE3: one move from center-column meta win

Import fixtures **only from tests**, never from production UI.

### Design-system port

- Tokens: `src/main.jsx` imports `design-system/styles/colors_and_type.css`
- Layout/motion: `src/styles/app.css` ported from `design-system/MetaToe.html`
- Extract CSS with `sed -n '11,371p' design-system/MetaToe.html` — BSD `head -n -1` does not support negative line counts on macOS

### Dev panel

`src/App.jsx` — `?dev=1` renders `DevMetricsPanel` with win/terminal/rematch/return rates and recent raw events.

### TDD unit order (plan U1–U6)

1. Scaffold + Vitest
2. `gameLogic.test.js` (rules + fixtures)
3. `metrics.test.js`, `rivalryStorage.test.js`
4. `appState.test.js`, integration playthrough
5. UI wired last

Run: `npm test` (28 tests on feature branch).

### Git / PR shape for greenfield

When all commits land on one branch, split for review:

1. `git branch feat/metatoe-playable-mvp` at full tip
2. `git reset --hard <docs-only-commit>` on `main`
3. Push `main`, then feature branch; open PR comparing implementation to docs base

Use Conventional Commits grouped by layer: `build:` → `feat(game):` → `feat(session):` → `feat(app):`.

## Why This Matters

- **Ultimate tic tac toe** coupling (sent-to, local wins, meta lines) breaks if rules live in components; pure `gameLogic` keeps acceptance tests stable.
- **Phase machine** separates product flow from grid state; `won` + `outcome` supports draw and win without extra phases.
- **Two completion rates** prevent strategy drift: product cares about decisive wins; ops still wants any terminal resolution including abandon on reload.
- **Fixtures file** documents non-obvious rule edge cases without brittle 20-move test scripts.
- **CE sequencing** (strategy → requirements → plan → ADR → TDD units → review → ship) produced a shippable vertical slice from a greenfield repo in one session.

## When to Apply

Use this pattern when:

- Building a **local-first, pass-and-play** game MVP with measurable session rituals (start → terminal → rematch → return)
- Rules are **non-trivial** and must be tested without the DOM
- Strategy metrics differ from **instrumentation completeness** (win-only vs any terminal outcome)
- You port **HTML mockup CSS** into a bundler app while keeping token CSS as the single source of color/type

Defer or skip when shipping static HTML only, online multiplayer, or persisted in-progress matches (all out of v1 scope).

## Examples

### `applyMove` with sent-to fallback

```javascript
export function applyMove(state, { board, cell }) {
  if (state.status !== 'playing') {
    return { ok: false, error: 'terminal', state };
  }
  const legal = getLegalMoves(state);
  const isLegal = legal.some((m) => m.board === board && m.cell === cell);
  if (!isLegal) {
    return { ok: false, error: 'illegal', state };
  }
  // ... apply, update meta, flip player
  const sentToBoard = cell;
  next.nextBoard = isBoardPlayable(next, sentToBoard) ? sentToBoard : null;
  return { ok: true, state: next };
}
```

### Metrics split

```javascript
terminalResolutionRate() {
  const started = readEvents().filter((e) => e.type === 'match_started').length;
  const completed = readEvents().filter((e) => e.type === 'match_completed').length;
  if (!started) return 0;
  return completed / started;
},
winCompletionRate() {
  const started = readEvents().filter((e) => e.type === 'match_started').length;
  const wins = readEvents().filter(
    (e) => e.type === 'match_completed' && e.outcome === 'win',
  ).length;
  if (!started) return 0;
  return wins / started;
},
```

### PLAY_MOVE terminal test (after review)

```javascript
it('PLAY_MOVE completes match and records match_completed', () => {
  let state = reduceApp(createInitialAppState(), {
    type: 'START_MATCH', nameX: 'ALEX', nameO: 'SAM',
  }, services);
  state = { ...state, game: createMetaColumnWinSetup() };
  state = reduceApp(state, { type: 'PLAY_MOVE', board: 7, cell: 2 }, services);
  expect(state.phase).toBe('won');
  expect(state.outcome).toEqual({ status: 'won', winner: 'O' });
  expect(services.metrics.events.some(
    (e) => e.type === 'match_completed' && e.outcome === 'win',
  )).toBe(true);
});
```

### Investigation dead ends (session history)

| Issue | What failed | Fix |
|-------|-------------|-----|
| Dead ternary in `getTurnBannerClass` | Draw and win both returned `'turn-banner done'` | Collapse to one class; copy in components |
| Invalid test move sequences | AE2/AE3 not reachable with short `play()` chains | Named fixtures in `gameLogic.fixtures.js` |
| macOS CSS extraction | `head -n -1` unsupported on BSD | `sed -n '11,371p' design-system/MetaToe.html` |
| Confetti keyframe | Missing `}` broke build; CSS existed but UI unwired | Fix keyframes; render confetti in `TerminalMoment.jsx` (win only, respects reduced motion) |
| Fixtures in production module | Test scaffolding exported from `gameLogic.js` | Move to `gameLogic.fixtures.js` |
| Manual `phase: 'won'` in tests | Skipped reducer metrics path | Add PLAY_MOVE terminal test via `createMetaColumnWinSetup` |
| Single-branch PR | Full diff included docs + implementation | Docs-only `main` + feature branch split |

## Related

- [ADR-0001: Vite app at repo root](../../decisions/ADR-0001-vite-app-at-repo-root.md)
- [Implementation plan](../../plans/2026-05-22-001-feat-metatoe-mvp-playable-plan.md)
- [Requirements origin](../../brainstorms/2026-05-22-metatoe-mvp-playable-requirements.md)
- [PR #1 — playable MVP](https://github.com/jessewalberg/talk-practice/pull/1)
- Prior session: [MetaToe MVP build](96c93794-c2e6-495e-b451-1fd7791cd71f)

**Refresh candidates (not updated here):** `STRATEGY.md` (localStorage vs analytics wording), `ADR-0001` (append post-merge implementation note), brainstorm deferred-items section.
