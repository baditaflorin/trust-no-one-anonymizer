# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server-side logs. Browser logs can leak implementation details and create noise during high-stakes use.

## Decision

Production code should avoid console output except for explicit developer diagnostics behind `import.meta.env.DEV`. User-visible failures appear in the app status panel and toast area.

No media samples, landmarks, SDP text, or device labels are logged.

## Consequences

Users receive actionable status without leaving sensitive traces in the console.

Debugging production issues may require users to reproduce with dev builds.

## Alternatives Considered

Remote logging was rejected because it would introduce telemetry and a server dependency.
