# BUILD-PLAN

Phase plan for the DETRAN consolidation (authoritative copy in the orchestrator
handoff plan; Decisions Ledger owner-confirmed 2026-08-23, binding):

- **Phase 0** — monorepo genesis (this scaffold) + senatran-mock port (W0.2) +
  mock adoption-prompt refresh (W0.3). Runs parallel with Phase 1.
- **Phase 1** — stynx platform round: jobs, outbox, notifications, worklist,
  mobile-runtime/offline-sync promotion (E6), gov.br-as-Cognito-IdP runbook.
- **Phase 2** — detran foundation: `backend/app` composition root + shared DDL/RLS
  kit (W2.1), `packages/senatran-adapter` (W2.2), `domains/ops` port (W2.3),
  `packages/ui` (W2.4), blueprint generators in `tools/` (W2.5).
- **Phase 3** — `domains/inf` ports + RAIT backend and `apps/rait/web` + teat app
  re-host + DASHBOARD skeleton.
- **Phase 4** — PORTAL: gov.br federation, `domains/portal`, `apps/portal/web`.
- **Phase 5** — `domains/est` + BOAT (`apps/boat/mobile`, real native layer).
- **Phase 6** — `domains/ch` (pec's 29 domains), infra retirement, parity
  checklists and origin archives. The independently bounded W6.3 consolidated
  Docusaurus capability was advanced on 2026-08-31 under ADR-0011; this does not
  represent completion of the remaining Phase 6 domain or retirement work.

Dependency graph: `P0 → P2 → P3 → P4 → P5 → P6`, with P1 feeding P2/P3 (worklist,
outbox) and P1.5 (mobile) blocking only P5. Gates per phase are law; see
`docs/meta/adr/` and `AGENTS.md`.
