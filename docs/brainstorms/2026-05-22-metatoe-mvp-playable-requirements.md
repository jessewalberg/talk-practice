---
date: 2026-05-22
topic: metatoe-mvp-playable
---

# MetaToe Playable MVP

## Summary

Ship a local-dev, pass-and-play MetaToe MVP for ultimate tic tac toe: lobby with rival names → one decisive match on the existing visual design → rematch loop, with motion-first event feel and local session tracking for match completion, immediate rematch, and 7-day rivalry return. v1 is a bet to prove friends choose this over pen and paper.

---

## Problem Frame

Friends with an ongoing rivalry who want a competitive head-to-head session on one device don't have a digital option that feels polished and worth playing. They default to pen and paper even when the rules are clear — not because tracking nested board state is impossible, but because the experience doesn't feel competitive or like an event worth settling a score in.

There is no concrete evidence yet that friends will reach for MetaToe; v1 exists to test that bet.

---

## Actors

- A1. **Rival X**: First pass-and-play player; enters a display name in the lobby and takes alternating turns.
- A2. **Rival O**: Second pass-and-play player; enters a display name in the lobby and takes alternating turns on the same device.

---

## Key Flows

- F1. **Start a rivalry match**
  - **Trigger:** Both rivals open MetaToe locally and reach the lobby.
  - **Actors:** A1, A2
  - **Steps:** Each rival enters a display name → one rival starts the match → active board and turn indicator appear → rivals alternate moves until a match winner is declared.
  - **Outcome:** A decisive match completes with a clear winner; session records the match as started and completed.
  - **Covered by:** R1, R2, R3, R4, R5, R10

- F2. **Rematch the same rivalry**
  - **Trigger:** A match ends and either rival chooses rematch.
  - **Actors:** A1, A2
  - **Steps:** Terminal moment displays (win or draw) → rematch prompt appears → rival accepts → new match begins with same names and fresh board state.
  - **Outcome:** A second match begins without returning to the lobby; session records an immediate rematch after a terminal outcome (win or draw).
  - **Covered by:** R6, R7, R10

- F3. **Return after days away**
  - **Trigger:** The same name-pair opens MetaToe again within seven days of their last match.
  - **Actors:** A1, A2
  - **Steps:** App recognizes the stored rivalry pair → rivals can start a new match from the lobby.
  - **Outcome:** A new match starts; session records a return visit for the pair.
  - **Covered by:** R8, R10

---

## Requirements

**Game rules**

- R1. The app implements **ultimate tic tac toe** rules: nine local 3×3 boards in a meta grid; a move in one local board sends the opponent to the corresponding meta board; local board wins claim the meta cell; three meta cells in a row wins the match.
- R2. Only **legal moves** are accepted: the target local board must be the one dictated by the opponent's previous move, unless that board is already won or full — in which case the active player may play in any open local board.
- R3. The app detects and displays **local board wins**, **drawn local boards**, and **match victory** correctly, including draws at the match level when applicable.
- R4. Invalid move attempts are **blocked** with clear feedback; the board state does not change.

**Lobby and rivalry ritual**

- R5. Before the first match, both rivals enter **display names** in the lobby; names appear in the turn banner and win moment.
- R6. When a match ends (win or draw), the app shows a **terminal moment** naming the winner or framing a draw; win variant uses decisive framing.
- R7. After the terminal moment, rivals can **rematch immediately** with the same names and a reset board — without returning to the lobby.
- R8. Rivalry pairs are remembered **locally by the two display names** so return visits within seven days can be recognized.

**Match presentation**

- R9. The playable MVP uses the **MetaToe visual design** defined in `design-system/MetaToe.html` and `design-system/styles/colors_and_type.css` — lobby, turn banner, meta board, moves log, and win states match that spec.
- R10. Moves and board state changes include **motion feedback** (token placement, board-win emphasis, win moment) so play feels consequential; sound is optional in v1.

**Session metrics (local)**

- R11. The app records **match terminal resolution** for session bookkeeping (win, draw, or abandoned on reload mid-match). The **strategy match-completion rate** (per STRATEGY.md) counts only matches that reach a **declared winner** (`outcome === win`).
- R12. The app records whether a **rematch started in the same session** immediately after a terminal match (win or draw) — not after an abandoned match.
- R13. The app records whether a **name-pair returned within seven days** to start another match.

---

## Acceptance Examples

- AE1. **Covers R2, R4.** Given rival X plays in the top-left cell of the active local board, when rival O attempts a move in a different local board while the sent-to board still has open cells, the move is rejected and O remains to play.
- AE2. **Covers R2.** Given the local board X was sent to is already won, when O's turn begins, O may legally play in any local board that still has open cells.
- AE3. **Covers R3.** Given O wins the center column of the meta grid (three local boards), when the third local win is registered, the match ends immediately with O declared winner.
- AE4. **Covers R6, R7.** Given a match ends with X as winner, when either rival taps rematch, a new match begins with the same names and an empty board without showing the lobby again.
- AE5. **Covers R8, R13.** Given rivals "ALEX" and "SAM" completed a match three days ago, when they open MetaToe and enter the same names, the app treats them as a returning rivalry pair and records a 7-day return when they start a new match.

---

## Success Criteria

- Two friends can pass a device, play a full ultimate tic tac toe match, and immediately rematch without confusion about whose turn or which board is active.
- The session feels noticeably more polished than pen and paper — rivals describe it as worth playing, not just functional.
- Local session data makes it possible to compute match completion rate, immediate rematch rate, and 7-day rivalry return rate after a few playtests.
- A downstream planner can scope implementation without inventing product behavior, scope boundaries, or success metrics.

---

## Scope Boundaries

- Classic 3×3 tic tac toe only mode
- Online, remote, or async multiplayer
- Production deployment, hosting, or installable PWA
- Return to lobby mid-session (changing rivals requires a fresh session / reload)
- User accounts, authentication, or cloud-synced rivalry history
- Running rivalry score across rematches (e.g., "X leads 2–1") — rematch resets the board only
- Sound as a v1 requirement (motion-first; audio if time allows)

---

## Key Decisions

- **Vertical slice over thin prototype:** Rules, rivalry ritual, presentation, and local metrics ship on one complete lobby → match → rematch path rather than rules-only or mockup-only milestones.
- **Ultimate tic tac toe only:** Classic mode deferred; avoids splitting lobby and presentation investment.
- **Rematch-only post-win:** Keeps the rivalry loop tight; new pairings start via a fresh session, not an in-app lobby return.
- **Motion before sound:** Event feel in v1 is primarily visual; audio is nice-to-have.
- **Local name-pair as rivalry proxy:** 7-day return tracking keys off two display names in browser-local storage — no accounts.
- **Local dev only for v1:** Prove the bet in development before deploy decisions.

---

## Dependencies / Assumptions

- `design-system/MetaToe.html` is the authoritative UI spec; referenced `src/` React modules do not exist in the repo yet and must be implemented.
- `STRATEGY.md` defines product intent, persona, metrics, and tracks; this MVP aligns to all three strategy tracks (presentation, rules engine, rivalry ritual).
- v1 is a **bet to prove** demand — no prior user evidence that friends will prefer MetaToe over paper.
- Pass-and-play on one device is the only supported interaction model in v1.

---

## Outstanding Questions

### Resolve Before Planning

_(none — synthesis confirmed)_

### Deferred to Planning

- [Affects R9][Technical] How to structure the playable app while preserving the design-system assets (extend in place vs. separate app consuming the design tokens).
- [Affects R10][Technical] Which motion moments are required for v1 vs. nice-to-have, mapped to specific UI states in `design-system/MetaToe.html`.
- [Affects R11–R13][Technical] Where local session/metric data is stored and how rivals can inspect it during development playtests.
