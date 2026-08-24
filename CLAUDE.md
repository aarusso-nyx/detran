# CLAUDE.md

Read `AGENTS.md` — it is the canonical agent-facing constitution for this repository
(mirroring the pec/teat convention: one source of truth, this file is a pointer).

Quick facts: DEVAI-governed (Constitution 0.3.0 vendored at root, `.devai/`
governance root, `@devai-nyx/cli` 0.3.0), STYNX platform substrate (`@stynx-nyx/*`
via GitHub Packages; `NODE_AUTH_TOKEN="$(gh auth token)"` locally). Domain-first
monorepo: `backend/` modular monolith (inf/est/ch/ops + portal/dashboard/shared),
`apps/` frontends only, `packages/senatran-adapter` as the sole national-API
boundary. Founding ADRs: `docs/meta/adr/ADR-0001…0004`.

Before making changes, read in order:

1. `AGENTS.md`
2. `README.md`
3. `BUILD-PLAN.md`
4. `DESIGN-DECISIONS.md` (index of `docs/meta/adr/`)
5. `.devai/constitution.md` (pointer to the vendored `CONSTITUTION.md`)
6. `docs/framework/schemas`
7. The specific file or invariant you intend to edit.

Declare the active role from Constitution Article 6 before scoped work:

- Owner for product/business docs.
- Architect for architecture, contracts, ADRs, security and invariants.
- Engineer for runtime code, configuration and dependency wiring.
- Inspector for tests.
- Auditor for read-only assessment.

Do not introduce a second governance framework: DEVAI is the governance provider and
STYNX is the platform substrate.
