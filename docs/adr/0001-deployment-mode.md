# 0001 - Deployment Mode

## Status

Accepted

## Context

The project must anonymize camera and microphone streams before media reaches any meeting, relay, or application server. The bootstrap constraint also requires GitHub Pages first unless a runtime backend is genuinely unavoidable.

Browser APIs can acquire local media, transform audio with Web Audio, transform video with canvas, run MediaPipe through browser WASM/WebGL, and create outgoing WebRTC tracks with `canvas.captureStream()` and `MediaStreamAudioDestinationNode`. User preferences can remain in local storage.

## Decision

Use Mode A: Pure GitHub Pages.

The app is a static Vite/TypeScript frontend published from `main/docs`. All runtime work happens in the browser. There is no backend, no server-side signaling service, no account system, and no runtime secret.

## Consequences

Raw camera frames, raw microphone samples, face landmarks, and processed avatar frames stay on the user's device unless the user explicitly sends processed tracks through their own WebRTC session.

The v1 WebRTC workflow uses manual copy/paste signaling. A hosted signaling or TURN service is intentionally not included because that would introduce operational infrastructure and possible metadata exposure.

GitHub Pages cannot set custom COOP/COEP headers, so WASM dependencies must work without requiring cross-origin isolation. Heavy modules must be lazy-loaded after user action.

## Alternatives Considered

Mode B was rejected because no offline data generation pipeline is needed for v1.

Mode C was rejected because a runtime API is unnecessary and would weaken the trust story unless future requirements add hosted signaling, shared rooms, identity, or cross-device sync.

