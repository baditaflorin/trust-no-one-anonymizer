# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A deploys only static files. There is no server, container, nginx, database, Prometheus, or runtime job.

## Decision

Deploy exclusively through GitHub Pages from `main/docs`.

The browser may call public static URLs and unauthenticated public APIs. No app-owned backend is deployed.

## Consequences

Operations are simple: push `main`, wait for Pages to serve the updated `docs/` content, and roll back with git.

No Docker artifacts or `deploy/` directory are needed in v1.

## Alternatives Considered

Docker Compose with nginx was rejected because no runtime API is needed.

