# 0006 - WASM Modules

## Status

Accepted

## Context

MediaPipe and RNNoise both use WASM-capable browser runtimes. GitHub Pages cannot set COOP/COEP headers, so shared-memory WASM and threading assumptions must be avoided.

## Decision

Use `@mediapipe/tasks-vision` for face landmarks and blendshapes. Load its WASM runtime lazily through `FilesetResolver` only after the user starts private media.

Use `@jitsi/rnnoise-wasm` as the RNNoise adapter boundary. In v1, audio is always processed through Web Audio timbre modulation, and the RNNoise module is lazy-initialized opportunistically when browser support and package runtime permit it. If RNNoise initialization fails, the app degrades to Web Audio-only modulation and surfaces that status.

Use UpscalerJS with an ESRGAN model as the browser-safe super-resolution adapter for avatar snapshots. Real-ESRGAN-class models are isolated behind the same adapter boundary so a browser-stable model can replace the ESRGAN slim model without changing the UI or WebRTC pipeline.

## Consequences

The app remains deployable on GitHub Pages without custom headers. Heavy modules do not affect first load.

Some advanced acceleration paths may be unavailable on browsers without WebGPU/WebGL support.

## Alternatives Considered

Self-hosting all WASM assets was rejected for v1 to keep the repository lean.

A Docker backend for model inference was rejected because raw media would need to leave the browser or a server would need access to sensitive intermediate representations.

