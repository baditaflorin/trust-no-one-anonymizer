# Privacy

Live site: https://baditaflorin.github.io/trust-no-one-anonymizer/

Repository: https://github.com/baditaflorin/trust-no-one-anonymizer

## Default Collection

The app collects no analytics and sends no app-owned telemetry.

Raw camera frames, raw microphone samples, facial landmarks, expression scores, avatar frames, and SDP text are not sent to a project backend because there is no backend.

## Browser Permissions

Camera and microphone access are requested only when the user presses Start. Stopping the session stops raw and processed media tracks.

## Local Storage

The app stores only non-sensitive preferences in `localStorage`:

- Avatar seed
- Timbre slider value
- RNNoise toggle
- ESRGAN enhancement toggle
- Public STUN toggle
- Privacy notice state

No media, landmarks, voice samples, device labels, or call history are stored.

## Public Network Calls

The static app may fetch:

- GitHub commit metadata from https://api.github.com/repos/baditaflorin/trust-no-one-anonymizer/commits/main
- MediaPipe runtime files from https://cdn.jsdelivr.net/
- MediaPipe Face Landmarker model files from https://storage.googleapis.com/

If Public STUN is enabled, the browser may contact `stun:stun.l.google.com:19302` for WebRTC connectivity. This does not send media, but it can expose network metadata to the STUN provider.

## Analytics

None in v1.
