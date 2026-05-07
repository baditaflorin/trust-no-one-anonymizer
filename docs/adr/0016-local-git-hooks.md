# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project uses local hooks instead of GitHub Actions. Hooks must be idempotent, documented, and runnable manually.

## Decision

Use a plain `.githooks/` directory wired by `make install-hooks`.

Hooks:

- `pre-commit`: ESLint, Prettier check, TypeScript check, and `gitleaks protect --staged`.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: run a lightweight dependency reminder and regenerate generated metadata when needed.

## Consequences

Checks run before code leaves the machine. Contributors need local Node tooling and gitleaks installed for the strict pre-commit path.

## Alternatives Considered

Lefthook was rejected because plain hooks are transparent and enough for v1.
