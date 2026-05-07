# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Media APIs fail often: permissions may be denied, devices may be missing, WASM may fail to load, or browsers may not support a feature.

## Decision

Use typed `Result` helpers for recoverable feature initialization. Convert unknown thrown values into display-safe error messages. UI status should explain the failing subsystem and provide the next useful action.

Never panic by throwing from long-running animation or audio callbacks. Stop the affected subsystem, keep the rest of the app usable, and allow the user to retry.

## Consequences

Users get clear degradation instead of a blank app. Tests can assert error conversion and fallback paths.

## Alternatives Considered

Letting exceptions bubble to a global handler was rejected because media apps need partial recovery.
