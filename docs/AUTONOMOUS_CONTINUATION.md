# MINIK autonomous continuation

Current source of truth: `main`, continuing from MINIK 1.65.0 Beta 66. Do not restart or replace the project.

## 2026-09-11 continuation

Two child-facing surfaces were moved further away from website/card UI while preserving the existing game, progress, profile, age, audio, PWA and lifecycle systems.

### Activity playground

- Replaced the legacy dense game-card grid with an immersive activity playground.
- Added a large bilingual hero, a prominent featured activity and staggered large game islands.
- Replaced the selected-game world-card grid with large world islands.
- Added narrow-phone and reduced-motion handling.
- Added regression coverage in `tests/games-playground.test.mjs`.

### Aquarium and rewards

- Preserved the large interactive aquarium tank.
- Replaced the reward-card shop grid with a large treasure reef.
- Replaced the outfit-card grid with a horizontal, snap-scrolling Mino character parade.
- Kept claim/equip/outfit logic, locks, star requirements and reward reveal behavior intact.
- Added narrow-phone and reduced-motion handling.
- Added regression coverage in `tests/aquarium-reef.test.mjs`.

## Continue next

Keep applying the same standard to remaining child-facing card-heavy areas. Prioritize achievements, story presentation and any game screens that still visually read as forms or small-card multiple choice. Preserve parent/admin density where it improves usability.
