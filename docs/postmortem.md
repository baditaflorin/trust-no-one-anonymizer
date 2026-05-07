# Postmortem

## What Was Built

V1 is a Mode A GitHub Pages app at https://baditaflorin.github.io/trust-no-one-anonymizer/.

It includes a real browser media pipeline: local getUserMedia capture, MediaPipe-driven expression tracking, deterministic avatar rendering, Web Audio timbre modulation, lazy RNNoise WASM initialization, optional ESRGAN snapshot enhancement, and manual WebRTC offer/answer export of processed tracks.

The UI includes the repository link https://github.com/baditaflorin/trust-no-one-anonymizer, the PayPal link https://www.paypal.com/paypalme/florinbadita, and visible version/commit metadata.

## Was Mode A Correct?

Yes. The core privacy claim depends on keeping media processing client-side before transmission. A runtime backend would not help v1 and would add trust and operations risk.

The main limitation is signaling. Manual SDP copy/paste is awkward, but it preserves Mode A. A hosted room service would be more usable, but that would move the project toward Mode C or a carefully scoped third-party static-friendly signaling choice.

## What Worked

- GitHub Pages from `main/docs` worked cleanly with Vite when `emptyOutDir` stayed false.
- Heavy media dependencies were kept behind dynamic imports.
- Playwright smoke tests catch base-path and Pages preview mistakes.
- The app can show the latest published commit with the unauthenticated GitHub API and a compiled fallback.

## What Did Not Work

- A real browser-safe Real-ESRGAN package was not as production-ready as the rest of the stack. V1 uses UpscalerJS ESRGAN slim behind an adapter and documents the replacement boundary.
- GitHub Pages cannot set COOP/COEP headers, so threaded WASM paths are not assumed.
- System-level Zoom/Meet virtual camera integration is outside a static web app.

## Surprises

- RNNoise’s WASM payload is large, but dynamic import keeps it out of the first-load path.
- The local desktop already had preview servers on the default Vite port, so this project uses port `4287`.

## Accepted Tech Debt

- Manual WebRTC signaling is intentionally basic.
- RNNoise processing uses ScriptProcessorNode for compatibility; an AudioWorklet path would be better after more browser validation.
- ESRGAN runs on keyframe snapshots, not every video frame.
- MediaPipe model assets load from public upstream URLs instead of being vendored.

## Next Three Improvements

1. Add an AudioWorklet RNNoise processor with verified latency measurements across Chrome, Edge, and Firefox.
2. Add optional static-friendly signaling through user-supplied room servers or a zero-retention rendezvous service with a separate ADR.
3. Add stronger avatar styles and a browser-stable Real-ESRGAN model package when one is mature enough for production use.

## Time Spent Versus Estimate

Estimated v1 bootstrap: 4 to 6 focused hours.

Actual implementation in this session: about 2 hours of scaffold, implementation, testing, docs, and Pages setup.
