# 0017 - Dependency Policy

## Status

Accepted

## Context

The app runs in a hostile privacy context. Dependencies must be production-ready, actively maintained, browser-compatible, and lazy-loaded when heavy.

## Decision

Use battle-tested libraries for core domains:

- `@mediapipe/tasks-vision` for face landmarks and blendshapes.
- `@jitsi/rnnoise-wasm` for RNNoise WASM integration boundary.
- `upscaler` and `@upscalerjs/esrgan-slim` for browser super-resolution snapshots.
- `zod` for settings validation.
- `vite`, `typescript`, `vitest`, `playwright`, `eslint`, `prettier`, and `tailwindcss` for tooling.

Do not add dependencies that collect telemetry, require frontend secrets, or force a runtime backend.

## Consequences

The app can ship a real browser media pipeline while keeping the initial load small through dynamic imports.

Security updates must be monitored manually because there is no CI workflow.

## Alternatives Considered

Custom face tracking, custom denoising, and custom WebRTC wrappers were rejected because established browser APIs and libraries exist.
