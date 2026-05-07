# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The app is static and public. No runtime secret can safely exist in frontend code.

## Decision

All configuration is public build-time metadata. `.env.example` documents public URLs only. `.env*` is ignored, and gitleaks is wired into local hooks.

The app never stores API tokens, passwords, or private keys. Public GitHub API calls are unauthenticated.

## Consequences

The app can be forked and deployed without secret provisioning. API rate limits for unauthenticated GitHub metadata calls are acceptable because the commit display is non-critical.

## Alternatives Considered

Encrypted frontend secrets were rejected because client-side encryption does not protect a secret distributed with the app.
