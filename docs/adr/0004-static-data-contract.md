# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no generated dataset and no runtime API. It still depends on static public assets: the GitHub Pages app, package-built JavaScript chunks, MediaPipe WASM files, and the Face Landmarker model.

## Decision

The static contract is:

- App shell and built chunks: `docs/index.html`, `docs/assets/*`.
- SPA fallback: `docs/404.html`.
- PWA metadata: `docs/manifest.webmanifest`.
- Local app version: `package.json` semver.
- Published commit: fetched client-side from `https://api.github.com/repos/baditaflorin/trust-no-one-anonymizer/commits/main` with a compiled fallback.
- MediaPipe runtime: public CDN URL pinned to the package major/minor version.
- Face Landmarker model: public MediaPipe model URL documented in source.

No user data, biometric data, preferences, or media artifacts are committed or uploaded.

## Consequences

Static files can be audited directly in git. Version and commit can be shown on the page without secrets.

The app relies on public CDNs for MediaPipe runtime/model loading in v1. If a CDN is blocked, the UI shows a module initialization error and the local fallback avatar remains available.

## Alternatives Considered

Committing the MediaPipe model to the repository was rejected because large binary model files would bloat history.

A backend model proxy was rejected because it would add infrastructure without increasing privacy.

