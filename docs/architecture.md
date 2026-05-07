# Architecture

Live site: https://baditaflorin.github.io/trust-no-one-anonymizer/

Repository: https://github.com/baditaflorin/trust-no-one-anonymizer

## C4 Context

```mermaid
C4Context
  title Trust No One Anonymizer - Context
  Person(user, "High-risk meeting participant", "Activist, witness, survivor, journalist, or source")
  System(app, "Trust No One Anonymizer", "Static GitHub Pages browser app")
  System_Ext(peer, "Remote peer or meeting bridge", "Receives processed WebRTC tracks")
  System_Ext(githubPages, "GitHub Pages", "Serves static HTML, JS, CSS, and docs")
  System_Ext(publicAssets, "Public model/CDN URLs", "MediaPipe runtime and model assets")

  Rel(user, app, "Grants camera/mic permission locally")
  Rel(githubPages, app, "Serves static app")
  Rel(app, publicAssets, "Lazy-loads public WASM/model assets")
  Rel(app, peer, "Sends processed avatar/audio tracks only")
```

## C4 Container

```mermaid
C4Container
  title Trust No One Anonymizer - Containers
  Person(user, "User", "Runs the app in a browser")
  System_Boundary(browser, "User Browser") {
    Container(ui, "App Shell", "Vite + TypeScript", "Controls, status, version, repo, and PayPal links")
    Container(capture, "Media Capture", "getUserMedia", "Gets raw camera and microphone tracks")
    Container(face, "Face Tracker", "MediaPipe Tasks Vision", "Maps blendshapes and head pose into expressions")
    Container(avatar, "Avatar Renderer", "Canvas 2D", "Draws the stable generated avatar")
    Container(audio, "Voice Processor", "Web Audio + RNNoise WASM", "Suppresses noise and modulates timbre")
    Container(enhance, "Enhancer", "UpscalerJS ESRGAN", "Enhances avatar keyframes on demand")
    Container(webrtc, "Manual WebRTC", "RTCPeerConnection", "Exports processed tracks via copy/paste SDP")
    Container(storage, "Settings", "localStorage + Zod", "Stores non-sensitive preferences")
  }
  System_Ext(peer, "Remote peer", "Receives processed media")

  Rel(ui, capture, "Starts/stops")
  Rel(capture, face, "Raw video frames stay local")
  Rel(face, avatar, "Expression state")
  Rel(capture, audio, "Raw audio samples stay local")
  Rel(avatar, webrtc, "Canvas captureStream video track")
  Rel(audio, webrtc, "MediaStreamAudioDestination audio track")
  Rel(ui, storage, "Read/write preferences")
  Rel(webrtc, peer, "Processed WebRTC media")
```

## Runtime Boundary

The GitHub Pages boundary is only static asset delivery. Runtime media processing happens after the page loads, inside the browser. There is no app-owned backend, no server logs, no media upload endpoint, and no analytics beacon.

## Module Boundaries

- `src/features/anonymizer/media/`: raw media acquisition and processed stream composition.
- `src/features/anonymizer/face/`: MediaPipe initialization and expression mapping.
- `src/features/anonymizer/avatar/`: deterministic avatar style and canvas rendering.
- `src/features/anonymizer/audio/`: RNNoise adapter and timbre modulation graph.
- `src/features/anonymizer/enhancement/`: lazy ESRGAN snapshot enhancer.
- `src/features/anonymizer/webrtc/`: manual offer/answer signaling helpers.
- `src/features/anonymizer/settings/`: local settings schema and persistence.
