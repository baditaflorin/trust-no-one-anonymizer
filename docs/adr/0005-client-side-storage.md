# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

The app needs to remember non-sensitive preferences such as avatar seed, modulation amount, enhancement setting, and whether the user has seen the privacy notice.

## Decision

Use `localStorage` for small settings and avoid IndexedDB/OPFS in v1. Store no media, no landmarks history, no audio buffers, and no call metadata.

The settings schema is validated with Zod before use.

## Consequences

The storage surface is easy to inspect and clear. There is no cross-device sync.

Future larger model caching may use Cache Storage through the service worker, but not for user media.

## Alternatives Considered

IndexedDB was rejected for v1 because the app has no large user-owned artifacts.

Server persistence was rejected because it conflicts with the privacy model.

