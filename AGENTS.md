# AGENTS.md — rules for agents working in detran

This repository is the DETRAN consolidation monorepo. It is **DEVAI-governed**
(`@aarusso-nyx/devai@1.4.5`, Constitution 1.0.0 pinned at
`.devai/pin/constitution.md`; `.devai/` is the governance root) and built on the
**STYNX** platform (`@stynx-nyx/*` from GitHub Packages; target **1.3.1** with
Angular 22 per ADR-0013 — workspace pins still resolve 1.1.1 until the ADR-0013
migration merges). The program is
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
   silently); keep the evidence chain (`.devai/state/evidence-chain.json`, tracked)
   intact — it is hash-chained and CI-verified.
5. **Architecture boundaries:** no app or domain module calls SENATRAN directly —
   everything goes through `packages/senatran-adapter` (ADR-0003). Backend domain
   modules are workspace packages with explicit deps — no deep relative imports
   (ADR-0001). One backend deployable, one Postgres, schema-per-domain, RLS on the
   request path via tenant context — never owner-role system context (ADR-0002).
6. **Registry auth:** `export NODE_AUTH_TOKEN="$(gh auth token)"` locally; CI uses
   the `PACKAGES_READ_TOKEN` secret. Never commit tokens.
7. **Record as you go:** consequential choices get an ADR in `docs/meta/adr/`;
   evidence records are emitted through the installed DEVAI 1.4.5
   `pnpm exec devai evidence record` boundary.

## Orientation

- Read first: `README.md`, `law/constitution.md`, `law/adr/`, `law/schemas/`,
  `BUILD-PLAN.md`, `DESIGN-DECISIONS.md`, `docs/meta/adr/` (ADR-0001…0004),
  `docs/start/index.md`, `docs/framework/schemas`, `.devai/config/project.json`.
- Layout: `backend/` (app + domains + ddl), `apps/` (frontends only),
  `packages/` (senatran-adapter, ui), `senatran-mock/`, `tools/`, `docs/` (7-section
  IA per `docs/_ia/categories.json`).
- Checks: `pnpm check` (format + typecheck), `pnpm devai:doctor`,
  `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human`.
- Declare the active Constitution Article 6 role (Owner/Architect/Engineer/
  Inspector/Auditor) before scoped work; do not introduce a second governance
  framework.
