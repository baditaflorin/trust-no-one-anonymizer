# Deploy

Deployment mode: GitHub Pages only.

Live URL: https://baditaflorin.github.io/trust-no-one-anonymizer/

Repository URL: https://github.com/baditaflorin/trust-no-one-anonymizer

GitHub Pages serves the `docs/` directory from the `main` branch. To republish manually, run `make build`, commit the updated `docs/` output, and push `main`.

Rollback is a normal git revert of the publishing commit followed by a push to `main`.

Local preview URL after `make pages-preview`: http://127.0.0.1:4287/trust-no-one-anonymizer/

Pages source is configured through the GitHub Pages API as:

- Branch: `main`
- Folder: `/docs`
- Build type: legacy branch deploy
- HTTPS enforced: yes

Pages-specific notes:

- The Vite base path is `/trust-no-one-anonymizer/`.
- `docs/404.html` is copied from `docs/index.html` for SPA fallback.
- `docs/.nojekyll` is committed so hashed assets are served as-is.
- GitHub Pages does not support `_headers` or `_redirects`; no COOP/COEP headers are assumed.

No custom domain is configured in v1. If one is added later, create `docs/CNAME`, point DNS at GitHub Pages, and document the exact domain here.
