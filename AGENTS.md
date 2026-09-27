# AGENTS.md — rules for agents working in detran

This repository is the DETRAN consolidation monorepo. It is **DEVAI-governed**
(`@aarusso-nyx/devai@1.5.6`, Constitution 1.0.0 pinned at
`.devai/pin/constitution.md`; `.devai/` is the governance root) and built on the
**STYNX** platform (`@stynx-nyx/*` **1.3.1** from GitHub Packages, Angular 22,
per ADR-0015 — migrated in WP-0 on 2026-09-13). The program is
executed in phases by an orchestrator with worker agents;
the phase plan and Decisions Ledger live in the orchestrator handoff plan and are
**binding** — do not re-litigate owner decisions.

## Hard rules

1. **This repo only.** Sibling repos under `../` (pec, teat, senatran, stynx, devai)
   are read-only reference material — never modify them.
2. **PR-only integration once branch protection is on.** Never push to `main`
   after protection is enabled; never force-push; required checks must be green.
   (Phase 0 genesis commits on `main` predate protection — that window is closed
   once protection lands.)
3. **Freeze policy (ADR-0004):** the moment a module's port merges here, the origin
   module is frozen — origin fixes land in detran only. Parity checklist per module
   before the freeze is relied on; origin repos are archived at parity.
4. **Gates are law:** never weaken a test to pass; never use `paths`/`paths-ignore`
   on content a required check consumes (an absent required check blocks merges
   silently); keep the evidence chain intact — since DEVAI 1.4.5 the governed chain is
   `record/proofs/chain.json` with per-round proof lines under `record/proofs/work/`
   (round `R-0001`); `.devai/state/evidence-chain.json` is the pre-1.4.5 legacy chain,
   kept tracked and read-only. Both are hash-chained and CI-verified.
5. **Architecture boundaries:** no app or domain module calls SENATRAN directly —
   everything goes through `packages/senatran-adapter` (ADR-0003). Backend domain
   modules are workspace packages with explicit deps — no deep relative imports
   (ADR-0001). One backend deployable, one Postgres, schema-per-domain, RLS on the
   request path via tenant context — never owner-role system context (ADR-0002).
6. **Registry auth:** `export NODE_AUTH_TOKEN="$(gh auth token)"` locally; CI uses
   the `PACKAGES_READ_TOKEN` secret. Never commit tokens.
7. **Record as you go:** consequential choices get an ADR in `docs/meta/adr/`;
   evidence records are emitted through the installed DEVAI 1.5.6
   `pnpm exec devai evidence record` boundary.

## Orientation

- Read first: `README.md`, `law/constitution.md`, `law/adr/`, `law/schemas/`,
  `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `docs/meta/adr/` (ADR-0001…0004),
  `docs/start/index.md`, `docs/framework/schemas`, `.devai/config/project.json`.
- Layout: `backend/` (app + domains + ddl), `apps/` (frontends only),
  `packages/` (api-clients, sefaz-adapter, senatran-adapter, ui), `senatran-mock/`, `tools/`, `docs/` (7-section
  IA per `docs/_ia/categories.json`).
- Checks: `pnpm check` (the root `package.json` `check` chain: format, orchestra
  bridge, KB and publish checks, state index, blueprints, contracts, parameters, UI and
  app builds, typecheck, app lint and tests, decorators, RLS DDL, role catalogue,
  lifecycle vocabulary, SENATRAN boundary and contracts, PEC parity and superset),
  `pnpm devai:doctor`,
  `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human`.
- Declare the active Constitution Article 7 role (Owner/Architect/Engineer/
  Inspector/Auditor; Article 6 governs authority by path) before scoped work; do not introduce a second governance
  framework.
