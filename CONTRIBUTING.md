# Contributing

Thank you for helping improve Trust No One Anonymizer.

## Local Workflow

1. Install dependencies with `npm install`.
2. Install hooks with `make install-hooks`.
3. Run `make lint`, `make test`, and `make smoke` before pushing.
4. Use Conventional Commits such as `feat: add media pipeline`.

## Security-Sensitive Changes

This project handles camera and microphone streams. Keep all raw media client-side, avoid telemetry by default, and document privacy-impacting changes in an ADR before implementation.

