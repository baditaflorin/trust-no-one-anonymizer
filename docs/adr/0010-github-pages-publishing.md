# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The project requires a working GitHub Pages URL from the first commit and a build artifact committed to the repository. The repository also needs human-readable docs and ADRs.

## Decision

Publish GitHub Pages from the `main` branch `/docs` folder.

Vite builds the app into `docs/` with `emptyOutDir: false` so `docs/adr/`, `docs/deploy.md`, and other documentation remain in place. Hashed assets are written under `docs/assets/`. `docs/404.html` is generated from `docs/index.html` for SPA fallback. `docs/.nojekyll` disables Jekyll processing.

The Vite `base` path is `/trust-no-one-anonymizer/`.

## Consequences

The live Pages URL is `https://baditaflorin.github.io/trust-no-one-anonymizer/`.

Build output and project documentation share the `docs/` directory, so the build script must avoid deleting docs. This is enforced by `emptyOutDir: false` and checked by smoke tests.

## Alternatives Considered

A `gh-pages` branch was rejected because it separates source and published artifacts.

Publishing from repository root was rejected because Vite build output would clutter the source root.

