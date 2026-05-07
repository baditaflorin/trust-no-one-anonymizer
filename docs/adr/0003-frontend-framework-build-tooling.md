# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs TypeScript, fast local iteration, reliable static output for GitHub Pages, and a small initial bundle with heavy media libraries loaded only after the user starts the tool.

## Decision

Use Vite with strict TypeScript and plain DOM modules.

Use Tailwind CSS for the stylesheet pipeline, Vitest for logic tests, Playwright for smoke testing, ESLint and Prettier for local checks, and Comlink only if worker isolation becomes necessary. Do not use React in v1 because the interface is a focused control surface and avoiding a framework keeps the initial payload smaller.

## Consequences

The initial app shell stays small and framework-free. Dynamic imports keep MediaPipe, RNNoise, and super-resolution code behind explicit user actions.

The team must keep DOM state management disciplined because there is no component framework enforcing patterns.

## Alternatives Considered

React was rejected for v1 because it adds payload and indirection without enough UI complexity to justify it.

Svelte was considered but rejected because plain TypeScript is sufficient for this single-screen app.

