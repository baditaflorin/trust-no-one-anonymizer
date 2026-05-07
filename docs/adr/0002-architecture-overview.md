# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app needs a privacy-sensitive media pipeline with clear boundaries: capture, transform, preview, and optional WebRTC export. Keeping these modules separate makes it easier to audit that raw media does not leave the device.

## Decision

Use feature modules under `src/features/anonymizer/`:

- `media`: camera and microphone capture plus lifecycle cleanup.
- `face`: MediaPipe Face Landmarker adapter and expression model mapping.
- `avatar`: deterministic avatar rendering on canvas.
- `audio`: Web Audio timbre modulation and RNNoise adapter boundary.
- `enhancement`: lazy super-resolution adapter for avatar snapshots.
- `webrtc`: manual WebRTC offer/answer signaling using processed tracks only.
- `settings`: local-only user preferences.

Shared app shell code lives in `src/app/`, and reusable utilities live in `src/shared/`.

## Consequences

Each privacy boundary can be tested independently. WebRTC receives only the processed stream produced by the video canvas and audio graph.

The UI can degrade gracefully if a heavy module fails to initialize.

## Alternatives Considered

A single media controller was rejected because it would make privacy review harder.

A full routing structure was rejected for v1 because the product is a single interactive tool.
