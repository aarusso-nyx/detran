# CLAUDE.md

Read `AGENTS.md` — it is the canonical agent-facing constitution for this repository
(mirroring the pec/teat convention: one source of truth, this file is a pointer).

Quick facts: DEVAI-governed (`@aarusso-nyx/devai@1.4.5`, Constitution 1.0.0
pinned at `.devai/pin/constitution.md`), STYNX 1.3.1 platform substrate (Angular 22, ADR-0013, WP-0 done 2026-09-13; `@stynx-nyx/*` via GitHub Packages; `NODE_AUTH_TOKEN="$(gh auth token)"` locally). Domain-first
monorepo: `backend/` modular monolith (inf/est/ch/ops + portal/dashboard/shared),
`apps/` frontends only, `packages/senatran-adapter` as the sole national-API
boundary. Founding ADRs: `docs/meta/adr/ADR-0001…0004`.

Before making changes, read in order:

1. `AGENTS.md`
2. `README.md`
3. `BUILD-PLAN.md`
4. `DESIGN-DECISIONS.md` (index of `docs/meta/adr/`)
5. `law/constitution.md`, `law/adr/`, and `law/schemas/`
6. `.devai/constitution.md` (pointer to `.devai/pin/constitution.md`)
7. `docs/framework/schemas`
8. The specific file or invariant you intend to edit.

Declare the active role from Constitution Article 6 before scoped work:

- Owner for product/business docs.
- Architect for architecture, contracts, ADRs, security and invariants.
- Engineer for runtime code, configuration and dependency wiring.
- Inspector for tests.
- Auditor for read-only assessment.

Do not introduce a second governance framework: DEVAI is the governance provider and
STYNX is the platform substrate.
