# AGENTS.md — rules for agents working in detran

This repository is the DETRAN consolidation monorepo. It is **DEVAI-governed** (`@aarusso-nyx/devai` — verify the installed version from `package.json`; the pinned constitution is `.devai/pin/constitution.md`; `.devai/` is the governance root) and built on the **STYNX** platform (`@stynx-nyx/*` **1.5.3** from GitHub Packages, Angular 22, per ADR-0015 — migrated to 1.3.1 in WP-0 on 2026-09-13, pinned to 1.4.0 in R-0021, updated to 1.5.3 under ADR-0039). The program is executed in phases by an orchestrator with worker agents; the phase plan lives in `docs/meta/knowledge-base/session-artifacts/orchestration-handoff.md` and the Owner decisions ledger in `docs/meta/decisions/<product>.md` (index: `docs/meta/decisions/README.md`); both are **binding** — do not re-litigate Owner decisions recorded there.

## Hard rules

1. **This repo only.** Sibling repos under `../` (pec, teat, senatran, stynx, devai) are read-only reference material — never modify them.
2. **PR-only integration.** Never push to `main`; never force-push; required checks must be green before merge.
3. **Freeze policy (ADR-0004).** Once a module's port merges here, the origin module is frozen — origin fixes land in detran only. Parity checklist per module before the freeze is relied on; origin repos are archived at parity.
4. **Gates are law.** Never weaken a test to pass; never use `paths`/`paths-ignore` on content a required check consumes (an absent required check blocks merges silently). The governed evidence chain is `record/proofs/chain.json` with per-round proof lines under `record/proofs/work/`; `.devai/state/evidence-chain.json` is the superseded legacy chain, tracked and read-only. The governed chain is verified in CI; the legacy chain is not currently checked there. Preserve both without rewriting history.
5. **Architecture boundaries.** No app or domain module calls SENATRAN directly — everything goes through `packages/senatran-adapter` (ADR-0003). Backend domain modules are workspace packages with explicit deps — no deep relative imports (ADR-0001). One backend deployable, one Postgres, schema-per-domain, RLS on the request path via tenant context — never owner-role system context (ADR-0002).
6. **Registry auth.** `export NODE_AUTH_TOKEN="$(gh auth token)"` locally; CI uses the `PACKAGES_READ_TOKEN` secret. Never commit tokens.
7. **Record consequential choices.** Consequential choices — architecture, contract, security, data-model and operational decisions with lasting effect — get an ADR in `docs/meta/adr/`; routine implementation choices do not. Evidence records are emitted through `pnpm exec devai evidence record`.

## Before you edit: routing table

| If you change…                                | Read first                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a domain module, DDL, RLS, tenant context     | `docs/meta/adr/ADR-0001…0004`, `DESIGN-DECISIONS.md` entry for that domain                                                                               |
| anything that touches SENATRAN                | `packages/senatran-adapter` contract, `senatran-mock/`                                                                                                   |
| a frontend app                                | `apps/<app>/README.md`, the STYNX UI package contract it consumes                                                                                        |
| authority, roles, evidence, governance config | the relevant article in `.devai/pin/constitution.md` (`law/constitution.md` is the entrypoint), `.devai/config/project.json`, `law/adr/`, `law/schemas/` |
| the build or phase plan                       | `BUILD-PLAN.md` and the binding phase plan                                                                                                               |
| schemas under `docs/framework/schemas`        | the schema and its consumers (`grep -rl`)                                                                                                                |

Always read the specific file or invariant you intend to edit before editing it. A failed check that names an article is also a read trigger. Layout: `backend/` (app + domains + ddl), `apps/` (frontends only), `packages/` (`api-clients`, `sefaz-adapter`, `senatran-adapter`, `ui` — published as `@detran/*`), `senatran-mock/`, `tools/`, `docs/` (7-section IA per `docs/_ia/categories.json`).

## Working

Use the Constitution Article 7 human role your task packet names (Owner for product/business docs; Architect for architecture, contracts, ADRs, security, invariants; Engineer for runtime code, config, dependency wiring; Inspector for tests; Auditor for read-only assessment); Article 6 governs authority by path. Declare the Article 7 role in one line at the start of scoped work (the packet's role when one exists). DEVAI is the governance provider and STYNX the platform substrate; do not introduce a second framework.

Values not found in a canonical document become a question in `docs/meta/knowledge-base/open-decisions-rait.md` when they are domain constants, deadlines, legal rules, state transitions or permissions. Ordinary engineering choices are yours to make and note.

Run the checks affected by your change. `pnpm check` is a long serial chain in the root `package.json` — format, STYNX pin, stack, law and DEVAI tests, orchestra bridge, KB and publish checks, state and rounds indexes, proof anchors, blueprints, contracts, parameters, UI and app builds, typecheck, app lint and tests, decorators, RLS DDL, role catalogue, lifecycle vocabulary, SENATRAN boundary and contracts, PEC parity and superset. That script is the authoritative list; every step is also runnable on its own, so prefer the individual script when you only need one. Also `pnpm devai:doctor`, and `pnpm exec devai evidence verify --scope chain --repo-root . --show-head --format human` when evidence changed. Report pre-existing baseline failures separately from failures your change introduced; an Inspector's deliberate red counterexample is a result, not a failed delivery.

Deliver what was asked; check in only when different readings of the request would lead to materially different work, when authority is missing, or before an irreversible effect.
