# MetaToe

Pass-and-play ultimate tic tac toe — local dev MVP.

Two rivals on one device: enter names, play a full match, hit the terminal moment (win or draw), rematch or start a new session.

## Setup

Requires [pnpm](https://pnpm.io/) 11+ (esbuild postinstall must be allowed — already set in `pnpm-workspace.yaml`).

```bash
pnpm install
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server — open the URL shown in the terminal |
| `pnpm test` | Run Vitest once (28 tests) |
| `pnpm build` | Production build |

Add `?dev=1` to the URL for the metrics inspection panel during playtests (win completion, terminal resolution, rematch, and return rates).

## Play flow

1. Enter rival names on the lobby screen and start the match.
2. Pass the device each turn; legal moves are enforced by the rules engine.
3. Win or draw triggers a full-screen terminal overlay — rematch keeps the same names.
4. **New session** reloads the app so a fresh pair can play.

## Project layout

| Path | Purpose |
|------|---------|
| `src/game/` | Pure ultimate tic tac toe rules (`gameLogic.js`) |
| `src/app/` | Phase machine: lobby → playing → won |
| `src/session/` | Rivalry memory and local metrics (`localStorage`) |
| `src/components/` | Board, lobby, terminal UI |
| `design-system/` | Reference HTML, tokens, and assets |

Design tokens and reference layout live in `design-system/`. The app imports `design-system/styles/colors_and_type.css` and ports layout CSS from `design-system/MetaToe.html`.

## Documentation

- [STRATEGY.md](./STRATEGY.md) — product intent and metrics
- [Requirements](./docs/brainstorms/2026-05-22-metatoe-mvp-playable-requirements.md) — R1–R13
- [Implementation plan](./docs/plans/2026-05-22-001-feat-metatoe-mvp-playable-plan.md) — completed MVP units
- [ADR-0001: Vite app at repo root](./docs/decisions/ADR-0001-vite-app-at-repo-root.md)
- [docs/solutions/](./docs/solutions/) — documented architecture patterns and learnings (YAML frontmatter: `module`, `tags`, `problem_type`)
