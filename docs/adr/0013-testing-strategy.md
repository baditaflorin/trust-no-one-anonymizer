# 0013 - Testing Strategy

## Status

Accepted

## Context

The app touches camera, microphone, browser media APIs, WebRTC, dynamic imports, and static GitHub Pages publishing. Fully automated real device tests are difficult, but core logic and build integrity can be tested locally.

## Decision

Use Vitest for unit tests around settings validation, expression mapping, avatar math, and WebRTC helpers.

Use Playwright smoke tests against a local static server serving `docs/`. The smoke test asserts the app loads, key links are visible, version/commit metadata renders, and a happy-path UI interaction works without requiring real camera permission.

`make test`, `make build`, and `make smoke` must be fast enough for pre-push hooks.

## Consequences

The most privacy-critical browser permission flow still needs manual verification on real devices.

Logic regressions and Pages build breakage are caught locally.

## Alternatives Considered

GitHub Actions was rejected because the project explicitly uses local hooks instead of CI.

