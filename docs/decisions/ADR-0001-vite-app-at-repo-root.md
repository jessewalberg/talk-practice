# ADR-0001: Vite + React app at repo root

| Field | Value |
|-------|-------|
| **id** | ADR-0001 |
| **status** | accepted |
| **date** | 2026-05-22 |
| **owner** | MetaToe team |
| **area** | architecture / tooling |
| **confidence** | high |
| **review_by** | 2026-08-22 |

## Decision

Implement the playable MetaToe MVP as a **Vite + React 18 + Vitest** application at the **repository root** (`src/`, `package.json`), importing design tokens and assets from the existing `design-system/` directory rather than extending the CDN-in-browser prototype in `design-system/MetaToe.html`.

## Context

- The repo has a visual design reference (`design-system/MetaToe.html`) and token CSS, but no runnable app, no `package.json`, and no referenced `design-system/src/*` game modules.
- Project policy requires TDD (Vitest) and conventional npm scripts for dev/test/build.
- The brainstorm deferred "how to structure the playable app" to planning ([requirements doc](../brainstorms/2026-05-22-metatoe-mvp-playable-requirements.md)).

## Options considered

1. **Vite app at repo root** — `npm run dev` / `npm test`; import `design-system/styles/colors_and_type.css` and assets via relative paths.
2. **Extend design-system in place** — keep single HTML file + inline scripts; harder to test and conflicts with TDD policy.
3. **Separate package / monorepo** — adds structure before v1 needs it.

## Chosen approach

Option 1: root-level Vite app consuming `design-system/` as the design source of truth. Port layout CSS from `MetaToe.html` into `src/styles/app.css`; keep class names stable for design fidelity.

## Tradeoffs

- **Pros:** Vitest TDD, fast HMR, clear separation of pure game logic vs React UI, familiar deploy path later.
- **Cons:** Two "entry points" (reference HTML vs app) until optional sync; board markup must be implemented (not fully present in mockup).

## Risks

- CSS drift between reference HTML and app — mitigate by preserving class names and side-by-side comparison during UI units.

## What would change our mind

- Need to ship zero-build static demo only (no npm) for a specific event.
- Design system becomes a published package consumed by multiple apps — then extract to workspace package.

## Follow-up work

- Minimal `README.md` with install/dev/test (U1).
- Optional: keep `design-system/MetaToe.html` as static reference only (no sync requirement in v1).

## Sources

- [Implementation plan](../plans/2026-05-22-001-feat-metatoe-mvp-playable-plan.md)
- [Brainstorm requirements](../brainstorms/2026-05-22-metatoe-mvp-playable-requirements.md)
- [STRATEGY.md](../../STRATEGY.md)
