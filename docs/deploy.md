# Deploy

Deployment mode: GitHub Pages only.

Live URL: https://baditaflorin.github.io/trust-no-one-anonymizer/

Repository URL: https://github.com/baditaflorin/trust-no-one-anonymizer

GitHub Pages serves the `docs/` directory from the `main` branch. To republish manually, run `make build`, commit the updated `docs/` output, and push `main`.

Rollback is a normal git revert of the publishing commit followed by a push to `main`.

No custom domain is configured in v1. If one is added later, create `docs/CNAME`, point DNS at GitHub Pages, and document the exact domain here.

