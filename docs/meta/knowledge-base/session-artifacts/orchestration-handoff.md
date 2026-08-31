# HANDOFF PROMPT — DETRAN Monorepo Consolidation & New Apps (BOAT, RAIT, PORTAL, DASHBOARD)

> Copy everything below this line into a fresh, pristine orchestrator agent (Claude or Codex). It assumes zero prior context.

---

## Your role

You are the **orchestrator** for a multi-phase consolidation of a Brazilian DETRAN software suite into a single monorepo, followed by the construction of four new applications. You do not write most of the code yourself: you **decompose phases into worker tasks, spawn workers (parallel where allowed), pick each worker's model tier and effort, verify their output against the gates defined here, and integrate via PRs**. All owner decisions are already made and recorded in the Decisions Ledger below — do not re-litigate them. Anything in the "Reserved for owner" list must be asked, once, as lettered questions.

## Ground truth (verify on start, then trust)

- Workspace: `repo://historical-workspace/` — one dir per repo: `pec`, `teat`, `senatran`, `stynx`, `devai`, plus others out of scope (`sgp`, `esocial`, `porm`, `e-contratos`).
- Platform: **stynx** (`stynx-nyx/stynx`, BUSL-1.1) publishes `@stynx-nyx/*` (~25 backend + 13 Angular packages, v0.5.0) to GitHub Packages; adoption mandatory for apps. **devai** (`devai-nyx/devai`, Apache-2.0) is the governance framework (`@devai-nyx/cli` 0.3.0, constitution 0.3.0, evidence-chain CI gate). Both remain **separate repos**, consumed via registry.
- Stack: pnpm 9, Node 24, TypeScript 6 ESM, NestJS 11, Angular 20/21, PostgreSQL (SQL-first, no ORM) + PostGIS, Vitest (tiered). Registry auth locally: `NODE_AUTH_TOKEN="$(gh auth token)"`; CI uses secret `PACKAGES_READ_TOKEN`.
- Existing apps: **pec** (driver-applicant health, backend-only NestJS, 29 domain modules, mature), **teat** (field-agent ticket app: NestJS backend + Angular web + Angular/Capacitor-configured mobile, 13 domains), **senatran** (mock of the national traffic API, 114 endpoints, standalone-by-exception per its D-0001 — no stynx deps, plain `pg`).
- Known platform lessons: GitHub Packages 403 `write_package` with `GITHUB_TOKEN` = package not repo-linked (linkage flows from `repository.url` at publish); npm provenance impossible on GitHub Packages; bot-pushed branches on public repos hold required checks at `action_required` — nudge with an empty user-authored commit; **never path-filter (`paths-ignore`) content consumed by required checks** — absent required check ≠ passing and blocks merges.

## Mission

Build the **`detran` monorepo** (private), consolidating pec, teat, senatran into a domain-first layout with **one unified backend** (modular monolith, single deployable), then deliver four new apps:

- **RAIT** — Recursos Administrativos de Infrações de Trânsito: webapp for ticket-contestation review, work distribution among reviewers, and 2nd-tier JARI appeal boards.
- **PORTAL** — public web + mobile app for drivers/citizens/owners to consult and appeal tickets (transversal across all domains).
- **BOAT** — Boletim de Ocorrência de Acidente de Trânsito: field-agent accident-reporting mobile app.
- **DASHBOARD** — staff webapp monitoring all operations (transversal; grows a panel-set every phase).

## Decisions Ledger (owner-confirmed 2026-08-23 — binding)

1. Single **private monorepo `detran`**; pec/teat/senatran repos frozen per ported module and archived at parity. senatran gives up its public-repo perks (accepted).
2. Domain-first around national systems: **`inf`** (RENAINF — infrações), **`est`** (RENAEST — sinistros), **`ch`** (RENACH — condutor/habilitação), **`vam`** (RENAVAM — reserved, not built). **`ops`** added as a cross-domain field-operations domain.
3. Transversal elements: PORTAL, DASHBOARD, **SENATRAN-MOCK** (current senatran, renamed), **SENATRAN-ADAPTER** (sole abstraction to the national API: `[SENATRAN-REAL]|[SENATRAN-MOCK] ⇄ [SENATRAN-ADAPTER] ⇄ backend ⇄ apps`).
4. Top-level **`backend/`** (composition root + domains + DDL) sibling to **`apps/`** which holds **frontends only**.
5. Migration = **fresh clean layout, code ported module-by-module** (no history import). Freeze policy: a module ported to detran is frozen at origin.
6. Backend = **modular monolith, one deployable**. Database = **one Postgres, schema-per-domain** + shared `auth/audit/storage/integration` schemas, RLS throughout.
7. Mobile/offline runtime is **promoted into stynx** (delivers stynx's deferred E6; amend its "no mobile" non-goal). Citizen identity = **Cognito + gov.br OIDC federation** (gov.br as a Cognito IdP; stynx auth stack unchanged).
8. App build order: **RAIT → PORTAL → BOAT**; DASHBOARD accretes panels alongside from Phase 3 on.

## Target architecture

### Filesystem

```
detran/
├── senatran-mock/             # ported mock (keeps its D-0001 standalone exception; own docker-compose)
├── backend/                   # THE unified NestJS modular monolith (single deployable)
│   ├── app/                   # composition root + stynx-runtime adapter kernel + unified policy matrix
│   ├── domains/               # real pnpm workspace packages, explicit deps — NO deep relative imports
│   │   ├── inf/<module>/      # ait-lifecycle, normative, measures, alcohol, defesas, penalidades, recursos, julgamento…
│   │   ├── est/<module>/      # crash-records, sinistro-analytics…
│   │   ├── ch/<module>/       # pec's 29 domains, repackaged
│   │   ├── ops/<module>/      # agents, devices, shifts, evidence custody, offline-sync glue, snapshots
│   │   ├── portal/<module>/   # citizen-facing aggregates + appeal intake (transversal)
│   │   ├── dashboard/<module>/# monitoring read-models (transversal)
│   │   └── shared/            # policy kit, common types, http conventions
│   └── database/ddl/          # auth, audit, storage, integration (shared) + inf.*, est.*, ch.*, ops.*
├── apps/                      # FRONTENDS ONLY — each actually builds (own package.json + angular.json)
│   ├── teat/{web,mobile}/  ├── boat/mobile/  ├── rait/web/
│   ├── portal/{web,mobile}/  ├── dashboard/web/  └── pec/web/   # pec slot reserved (backend-only today)
├── packages/
│   ├── senatran-adapter/      # see below
│   └── ui/                    # shared Angular kit atop @stynx-nyx/angular-ui
├── tools/  docs/  .devai/  .github/
```

### SENATRAN-ADAPTER (`packages/senatran-adapter`)

No app or domain module ever calls SENATRAN directly (add a boundary check like teat's `.stynxrc.json` + `verify-stynx-boundary.ts`):

- Typed ports per national system: renainf, renaest, renach, sne, cdt, wsdenatran-read (renavam-ready). English domain types mapped from Portuguese wire DTOs, **generated from `senatran-mock/docs/framework/contracts/openapi{,-transactional}.yaml`**.
- `SENATRAN_PROVIDER=mock|real` config switching (generalize pec's `RENACH_PROVIDER` pattern in `pec/domain/integration-renach/api/src/renach/renach.module.ts`); one client implementation, different base/auth material.
- Resilience via `@stynx-nyx/integration-adapter` — circuit breaker, timeouts, **retries actually enabled** (teat wired then disabled them), idempotency keys on writes (copy pec's deterministic-key + `ALREADY_OPEN` recovery in `renach.http.adapter.ts`), error envelope `{returnCode,message}` → category taxonomy.
- Test kit: magic-key/fixture helpers; contract tests run against senatran-mock composed in CI. Real target ships behind per-surface feature flags (real payload schemas are low-confidence — see `pec/docs/meta/project/integrations/known-gaps.md`).

### Unified backend principles (debt from pec/teat fixed once, here)

- Composition root shaped like `pec/apps/api/src/{app.module.ts,stynx-runtime.ts}` (the 8 stynx adapter hooks) with teat's **fail-closed runtime profiles** (`teat/apps/api/src/stynx-runtime.ts`: dev token verifier throws outside local profiles).
- **One policy matrix** namespaced `«domain»:«resource»:«action»`, role union (pec's 15 + teat's 9 staff roles + `CIDADAO`); `@Resource`/`@Action` decorators + CI decorator check (port `pec/scripts/verify-controller-decorators.ts`).
- **Tenancy (UF DETRANs) enforced on the request path**: `withTenantContext` from controllers — never owner-role `withSystemContext` (teat's current bug: RLS exists in `20-teat-rls.sql` but every repository bypasses it). Full pec stack: RLS + entitlement policy + `enforce_tenant_id` auto-triggers (`pec/database/ddl/11-auth-functions.sql`) + RLS smoke gate. **No optional-DB in-memory fallback** (teat's repositories silently write to Maps — fail hard instead).
- Append-only hash-chained `audit.events` (`pec/database/ddl/14-audit-functions.sql`); the interceptor audit sink must actually persist (pec's `PecAuditSink` is an in-memory array — fix, don't port).
- Blueprint-driven generation from teat (`teat/docs/framework/product/blueprints/BP-*.json` + generators) made **regenerable-only**: CI drift check comparing generated files to blueprint output; never hand-edit (teat's 13 generated copies diverged).
- OpenAPI generated from controllers + drift gate (pec's `openapi:check`); 4-tier Vitest (unit/integration/e2e/real) with shared `*.behavior.ts` suites; PostGIS SRID 4674 kit (`teat/database/ddl/12-teat-functions.sql`, `security_invoker` views).
- Test-only auth bypasses live in test-only modules (pec's `ALLOW_CONTRACT_TESTS`/`x-test-role` branch sits in production code — don't repeat).

## Asset map (port FROM here)

| Asset                                   | Source                                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Adapter kernel + runtime profiles       | `pec/apps/api/src/stynx-runtime.ts`, `teat/apps/api/src/stynx-runtime.ts`                                                                                                                                                                        |
| RBAC matrix + guard/evaluator           | `pec/domain/shared/api/src/pec-policy.ts` + `.guard.ts`; `teat/domain/shared/api/src/teat-policy.ts`                                                                                                                                             |
| Outbox + `FOR UPDATE SKIP LOCKED`       | `pec/domain/transmissions-detran-transmissions/.../transmissions.service.ts`                                                                                                                                                                     |
| Two-tier signed review (JARI precedent) | `pec/domain/juntas-medical-board/.../juntas.service.ts` (PDF→PAdES sign→status+outbox in one tx; `escalated_to_cetran`)                                                                                                                          |
| RLS/tenancy DDL kit                     | `pec/database/ddl/{11-auth-functions,22-pec-policies,14-audit-functions}.sql`                                                                                                                                                                    |
| Offline mobile runtime (7 ports)        | `teat/apps/mobile/src/app/mobile-runtime.ts` (+ `mobile-test-adapters.ts`)                                                                                                                                                                       |
| Offline sync server + invariant         | `teat/domain/offline-offline-sync/`, `INV-OFFLINE-001.json`, `UNIQUE(tenant_id,payload_hash)`                                                                                                                                                    |
| Evidence custody (polymorphic)          | teat DDL `evidence.*` (`evidence_link` entity_type/entity_id)                                                                                                                                                                                    |
| Crash/sinistro seed (BOAT)              | teat DDL `crash.*`; `crash-crash-records` domain; sinistro UX: 29 UCs (UC-1.226–254), 11 screens in `mobile-ux-parity.registry.ts`; prototypes `teat/docs/meta/prototypes/app/src/` (`CrashScreen.jsx`, `OsmMap.jsx`, `services/geolocation.js`) |
| senatran CI service pattern             | `teat/.github/workflows/teat-ci.yml:103-146` (adapt: compose from in-repo `senatran-mock/`)                                                                                                                                                      |
| CI economy + evidence gate              | teat's `teat-ci.yml` + `audit.yml` (weekly full re-run, revocation procedure); devai `reusable-evidence-gate.yml`                                                                                                                                |
| Docs-IA migration lessons               | `teat/docs/adopters/pilots/teat-r12/r12-docs-ia-retro.md`                                                                                                                                                                                        |
| stynx adoption docs                     | `stynx/docs/adopters/stynx/porting-pack/` (read `18-GAPS-AND-OPEN-QUESTIONS.md` first), `STYNX-SPEC-v0.6.md`                                                                                                                                     |

## Phase plan with worker orchestration

Worker sizing legend — **L** = strongest model, high/max effort (architecture-critical, security-critical, cross-cutting design); **M** = mid model, medium effort (module ports, feature builds, test suites); **S** = small model, low effort (mechanical: renames, config, doc moves, regeneration, verification scripts). Every worker gets: the relevant slice of this prompt, explicit file paths, and its acceptance gate. Use isolated worktrees for parallel workers touching the same repo. All integration is PR-only; never push to main.

### Phase 0 — Monorepo genesis + senatran-mock port _(runs parallel with Phase 1)_

- W0.1 **(L)** Scaffold `detran`: workspace layout above, `.devai` root (constitution 0.3.0), 7-section docs IA, `.npmrc`, staged CI skeleton + evidence gate, branch protection. Author the founding ADRs: domain-first layout, modular monolith, senatran-adapter sole-boundary, freeze policy.
- W0.2 **(M)** Port senatran → `detran/senatran-mock` (self-contained, no stynx deps, 245 tests): copy, rename, keep D-0001 standalone status, own compose; wire as in-repo CI service. Gate: full senatran suite green in detran CI.
- W0.3 **(S)** Refresh the stale mock adoption prompt (`docs/integration/adopt-senatran-mock.prompt.md` claims 87 endpoints; reality is 114 incl. RENAEST/SNE/CDT).

### Phase 1 — stynx platform round _(parallel with Phase 0; each package = one worker; 1.1–1.4 parallel, 1.5 may trail)_

- W1.1 **(M)** `@stynx-nyx/jobs` (E2): scheduler/worker runtime wrapped in `withSystemContext()`, backoff policy.
- W1.2 **(M)** `@stynx-nyx/outbox` (E3): promote pec's outbox + SKIP LOCKED claim + HMAC-signed ACK webhook.
- W1.3 **(M)** `@stynx-nyx/notifications`: email/SMS/push adapters + templates + delivery tracking, atop `preferences` contracts.
- W1.4 **(L)** `@stynx-nyx/worklist`: claim/release/reassign with audit, distribution strategies, SLA/prazo clocks; built over jobs+flow. (RAIT's backbone — design-heavy.)
- W1.5 **(L)** Mobile promotion (E6): `mobile-runtime.ts` → `@stynx-nyx/mobile-runtime` (framework-free) + `@stynx-nyx/offline-sync` (Nest server module); generalize `entityType`/numbering; amend STYNX-SPEC §1.2/§12.
- W1.6 **(S)** gov.br-as-Cognito-OIDC-IdP runbook in `@stynx-nyx/auth` docs (closes stynx gap G-005/Q-003); fix the `nestjs-cls` issue pec monkey-patches (`patchLinkedClsRootModule`).
- Gates: stynx round governance (contracts doc, invariants, porting-pack entries); pec/teat CI green against published versions.

### Phase 2 — detran foundation _(after 0; W2.1 first, then 2.2–2.5 parallel)_

- W2.1 **(L)** `backend/app` composition root: adapter kernel, profiles, unified policy matrix, tenancy enforcement, audit sink persisted to DB chain. Plus `backend/database/ddl` shared schemas + RLS kit + PostGIS 4674 kit.
- W2.2 **(L)** `packages/senatran-adapter` per spec above + boundary check + contract tests vs senatran-mock.
- W2.3 **(M)** `backend/domains/ops`: port teat's agents/devices/shifts/homologation, `snapshots.*`, evidence custody, offline-sync glue (consuming `@stynx-nyx/offline-sync`).
- W2.4 **(M)** `packages/ui`: Angular kit atop `@stynx-nyx/angular-ui` (make teat's seven declared-but-unused angular packages actually used).
- W2.5 **(S)** Port teat's blueprint generators into `tools/` with the regenerable-only drift check.
- Gate: throwaway domain module boots all profiles; RLS smoke, decorator check, OpenAPI drift, mock CI service, evidence gate all green.

### Phase 3 — `domains/inf` + RAIT + DASHBOARD skeleton

- W3.1 **(M×N, parallel per module, worktrees)** Port teat infraction domains → `backend/domains/inf/` (ait-lifecycle, normative, measures, alcohol), fixing tenant-context per module. Freeze each at origin on merge.
- W3.2 **(M)** senatran-mock extensions: `GET`/list for recursos, worklist-style queries ("pending julgamento for órgão X").
- W3.3 **(L)** RAIT backend: `domains/inf/{defesas,penalidades,recursos,julgamento}` — intake via adapter, distribution via `@stynx-nyx/worklist`, app-local JARI board model (colegiado, pauta, relator, votes), decision pipeline on pec's junta pattern, 2nd-instance escalation.
- W3.4 **(M)** `apps/rait/web` (Angular 21, angular-flow + packages/ui).
- W3.5 **(M)** Re-host `apps/teat/{web,mobile}` on the unified backend (make them actually build — teat's current apps have no build system).
- W3.6 **(M)** `apps/dashboard/web` skeleton + `domains/dashboard` read-models: worklist metrics, outbox health, adapter telemetry, offline-sync queues (reuse `angular-audit`/`angular-flow` screens).
- Gate: RAIT E2E — recurso intake → worklist claim → relator decision signed → outbox publishes julgamento to mock.

### Phase 4 — PORTAL

- W4.1 **(L)** Citizen identity: gov.br federation via Cognito per W1.6 runbook; staff-pool vs citizen-pool decision goes to owner (reserved).
- W4.2 **(M)** senatran-mock CDT extensions: citizen defesa/recurso submission write path.
- W4.3 **(M)** `domains/portal`: aggregates over inf/est/ch (tickets, points, CNH via adapter CDT), appeal submission into RAIT worklist, notifications (SNE semantics), LGPD via `@stynx-nyx/privacy`.
- W4.4 **(M)** `apps/portal/web` (PWA); mobile shell deferred to after Phase 5 (read-mostly on `@stynx-nyx/mobile-runtime`).
- W4.5 **(S)** DASHBOARD: portal + notification-delivery panels.
- Gate: E2E — citizen files recurso in PORTAL → appears in RAIT worklist → decision → PORTAL shows outcome + notification delivered.

### Phase 5 — `domains/est` + BOAT _(needs W1.5)_

- W5.1 **(M)** Move teat's `crash.*` DDL + `crash-crash-records` → `domains/est`; senatran-mock RENAEST extensions (typed veiculos/pessoas/vitimas, lat/long on sinistro, search, evidencias parity).
- W5.2 **(L)** `apps/boat/mobile` on `@stynx-nyx/mobile-runtime` + `domains/ops`; migrate sinistro UX corpus + prototypes. **The native layer is genuinely new for everyone**: actually install Capacitor, camera, real GPS, signature capture, hardware-backed secure storage, server-side device attestation (posture today is client-asserted — close that hole here).
- W5.3 **(S)** DASHBOARD: field-ops/sinistro panels.
- Gate: offline E2E — draft sinistro offline with evidence → sync batch → RENAEST publish via adapter → DASHBOARD reflects it.

### Phase 6 — `domains/ch` (pec port) + closeout

- W6.1 **(M×N, parallel per module, worktrees)** Port pec's 29 domains → `domains/ch` (largest port, lowest coupling — hence last; PORTAL's CNH views use adapter CDT, not pec internals). pec runs from its repo until here.
- W6.2 **(M)** Retire duplicated infra as ch adopts the kernel: outbox → `@stynx-nyx/outbox`, RENACH client → senatran-adapter, drop dead deps (`@stynx-nyx/privacy`/`sessions` declared-unused), move `ALLOW_CONTRACT_TESTS` bypass to a test-only module.
- W6.3 **(S)** Parity checklists; archive pec/teat/senatran repos; consolidate Docusaurus into one detran site.
- Gate: pec's full behavior suite green from `domains/ch`; portfolio E2E rerun.

### Dependency graph

```
P0 ─┬→ P2 → P3 (inf + RAIT + DASHBOARD) → P4 (PORTAL) → P5 (est + BOAT) → P6 (ch + archive)
P1 ─┘        (P1.5 mobile promotion only blocks P5; P1.1–1.4 block P3's worklist/outbox use)
```

## Orchestration rules

1. **PR-only; never push to main.** Required checks on every PR; evidence gate wired so failure/skip goes RED.
2. **Freeze policy**: origin module frozen the moment its detran port merges; parity checklist (endpoints, DDL, tests) signed off per module.
3. **Gates are law**: never weaken tests to pass; never `paths-ignore` content a required check consumes; name gates by architecture, not build chronology (no "wave1..N"); prune inherited gate count (~30 in pec/teat) to essentials before apps multiply.
4. **Parallelism**: parallel workers only on disjoint modules, each in its own worktree; sequential where a gate or dependency (graph above) says so.
5. **Model economy**: default M; escalate to L only for the tasks marked L (kernel, adapter, worklist, identity, BOAT native/attestation); drop to S for mechanical work. If a worker output fails its gate twice, escalate one tier and retry with the failure context.
6. **Reserved for owner** (ask as lettered decision questions, once): staff vs citizen Cognito pool split; senatran-mock public mirror (currently: no); RAIT statutory prazo values; any license/visibility change; anything irreversible.
7. **Deferred by decision** (do not build): suspension-of-license process, payment execution, virus scanning (stynx E8), RENAVAM (`vam`) build-out, `apps/pec/web`.
8. **Record as you go**: ADRs for every consequential choice; keep the devai evidence chain intact; update the mock adoption prompt and porting-pack docs when surfaces change.

## Acceptance (suite-level)

Final E2E across the suite, observed by DASHBOARD: PORTAL citizen (gov.br-federated) files a recurso → RAIT worklist distributes it → relator decision PDF signed (PAdES) → outbox publishes julgamento through senatran-adapter to senatran-mock → PORTAL shows the outcome and the citizen is notified → audit hash chain verifies end-to-end.
