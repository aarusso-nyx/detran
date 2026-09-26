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

## Addendum 2026-09-13 — work packages from the definition round

The phase schedule above is superseded, for the infractions scope, by the work packages of the
build packs in `docs/framework/arch/`: `rait-build-pack.md` (WP-0, WP-A…WP-F, WP-P),
`teat-build-pack.md` (WP-T0…T6), `portal-build-pack.md` (WP-P0…P6), `boat-build-pack.md`
(WP-B0…B5) and `dashboard-build-pack.md` (WP-D0…D5), plus the shared parameter store of
ADR-0021 (WP-A). Entry conditions and open decisions: `docs/meta/knowledge-base/decision-closure-plan.md`
(gate closed by the Owner on 2026-09-13, steering §H).

## Work-package state (R-0018, 2026-09-26)

State of every work package of the five build packs in `docs/framework/arch/`, read from
`docs/meta/agents/orchestra/waves.md` (wave plan and history) and the round closures in
`record/proofs/compliance/closures/`. "Merged" means the round's pull requests are merged into
`main`; the delivered scope, and what stayed out, is the one recorded in the build-pack section of
each work package. Campaign C-0002 (R-0017…R-0032): `work/campaigns/C-0002-consolidacao.md`; round
state: `work/rounds/README.md`.

| App       | Work packages          | Round               | Merge PRs               | Closure | State                                                    |
| --------- | ---------------------- | ------------------- | ----------------------- | ------- | -------------------------------------------------------- |
| RAIT      | WP-0                   | R-0001 (pre-method) | #28                     | —       | merged                                                   |
| RAIT      | WP-A (parameter store) | R-0004              | #37                     | PC-0002 | merged                                                   |
| RAIT      | WP-A (rest)            | R-0006              | #39, #43                | PC-0004 | merged                                                   |
| RAIT      | WP-B, WP-C             | R-0007              | #69, #94                | PC-0011 | merged                                                   |
| RAIT      | WP-D, WP-E, WP-F       | R-0012              | #79, #81, #85, #90, #92 | PC-0010 | merged                                                   |
| TEAT      | WP-T0                  | R-0001 (pre-method) | #29                     | —       | merged                                                   |
| TEAT      | WP-T1                  | R-0005              | #40, #41, #42, #44      | PC-0003 | merged                                                   |
| TEAT      | WP-T2, WP-T3           | R-0008              | #47, #48, #49, #50, #51 | PC-0005 | merged                                                   |
| TEAT      | WP-T4, WP-T5, WP-T6    | R-0013              | #70, #73, #82, #113     | PC-0013 | merged; WP-T6 as UI and workflow homologation (ADR-0033) |
| PORTAL    | WP-P0…WP-P3            | R-0009              | #54, #56                | PC-0006 | merged                                                   |
| PORTAL    | WP-P4…WP-P6            | R-0014              | #60…#66                 | PC-0007 | merged                                                   |
| BOAT      | WP-B0…WP-B3            | R-0010              | #55, #71                | PC-0008 | merged                                                   |
| BOAT      | WP-B4, WP-B5           | R-0015              | #107, #116              | PC-0014 | merged                                                   |
| DASHBOARD | WP-D0                  | R-0003              | #32                     | PC-0001 | merged                                                   |
| DASHBOARD | WP-D1…WP-D3            | R-0011              | #83, #87                | PC-0009 | merged                                                   |
| DASHBOARD | WP-D4, WP-D5           | R-0016              | #80, #103               | PC-0012 | merged; console screens at level L0                      |
