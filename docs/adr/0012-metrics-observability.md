# 0012 - Metrics and Observability

## Status

Accepted

## Context

The project is privacy-sensitive and has no backend. Analytics can create risk even when nominally anonymous.

## Decision

Ship no analytics in v1.

Runtime observability is local-only: status indicators show whether camera, microphone, MediaPipe, RNNoise, enhancement, and WebRTC are active. Basic FPS and audio latency estimates are displayed to the user but not transmitted.

## Consequences

There is no product usage telemetry. Success must be measured through local tests, manual validation, issue reports, and user feedback.

## Alternatives Considered

Plausible and a Cloudflare Worker beacon were rejected for v1 because usage insight is less important than minimizing metadata collection.

