.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview docker-build docker-push release compose-up compose-down clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server
	npm run dev

build: ## Build the Pages-ready static site into docs/
	npm run build

data: ## No-op in Mode A
	@echo "Mode A has no static data pipeline."

test: ## Run unit tests
	npm run test

test-integration: ## No-op placeholder for future browser/device integration tests
	@echo "No integration tests in v1."

smoke: ## Build and run Playwright smoke tests against docs/
	scripts/smoke.sh

lint: ## Run all linters and type checks
	npm run lint
	npm run fmt:check
	npm run typecheck

fmt: ## Autoformat source files
	npm run fmt

pages-preview: ## Serve docs/ exactly like GitHub Pages
	npm run pages-preview

docker-build: ## Not applicable in Mode A
	@echo "Mode A has no Docker image."

docker-push: ## Not applicable in Mode A
	@echo "Mode A has no Docker image."

release: ## Tag a semver release after checks
	@test -n "$(VERSION)" || (echo "Usage: make release VERSION=v0.1.0" && exit 1)
	make lint
	make test
	make build
	make smoke
	git tag "$(VERSION)"
	git push origin "$(VERSION)"

compose-up: ## Not applicable in Mode A
	@echo "Mode A has no compose stack."

compose-down: ## Not applicable in Mode A
	@echo "Mode A has no compose stack."

clean: ## Remove local build/test outputs except committed docs
	rm -rf coverage tmp playwright-report test-results

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	@test -n "$(MSG)" || (echo "Usage: make hooks-commit-msg MSG=.git/COMMIT_EDITMSG" && exit 1)
	.githooks/commit-msg "$(MSG)"

hooks-pre-push:
	.githooks/pre-push
