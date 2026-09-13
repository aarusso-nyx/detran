# DESIGN-DECISIONS

Canonical decisions live as ADRs under `docs/meta/adr/` — this file is the index
(mirroring the teat convention):

- **ADR-0001** — Domain-first monorepo layout (inf/est/ch/vam-reserved/ops +
  transversal portal/dashboard; `backend/` sibling of frontends-only `apps/`).
- **ADR-0002** — Unified backend as a modular monolith: one deployable, one
  Postgres, schema-per-domain, RLS on the request path, inherited debt fixed once
  in the composition root.
- **ADR-0003** — `packages/senatran-adapter` as the sole national-API boundary;
  `SENATRAN_PROVIDER=mock|real`; boundary check in CI.
- **ADR-0004** — Migration policy: fresh layout, module-by-module port, origin
  freeze on merge, archive at parity.
- **ADR-0005** — Unified backend kernel: exact registry pins, fail-closed
  profiles, role-union mapping, request-path tenancy, persisted audit chain and
  the Phase-2 backend CI gate.
- **ADR-0010** — `detran/docs` is the single writable authority for the business/legal knowledge
  base; source provenance is immutable, and publication is status-gated and fail-closed.
- **ADR-0011** — Phase 6 documentation capability: deterministic seven-section
  Docusaurus projection, active Constitution publication, blocking CI validation,
  and separately authorized local GitHub Pages publication.
- **ADR-0012** — `WF-INF-003` is the canonical infraction lifecycle state machine
  (Owner, 2026-09-12); `WF-INF-001` kept as a pointer; the infraction aggregate
  awaits its own blueprint before any runtime implementation.
- **ADR-0013** — STYNX 1.3.1 / Angular 22 / DEVAI 1.4.5 is the platform target
  (Owner, 2026-09-12; workspace pins migrate in WP-0); the canonical role
  catalogue gains the ten-code RAIT family, persisted in `auth.role_catalog`;
  the `WF-INF-003` vocabulary is persisted as `inf.infraction_*_ref` tables.

- **ADR-0014…0018** — boundary set (accepted by the Owner on 2026-09-13) for the infractions scope:
  infraction aggregate + notification module (0014), collection/payment/refund
  (0015), documents and signature as STYNX substrate (0016), `portal` domain for
  identity levels, request lifecycle, inbox and ombudsman (0017), projections as
  the only cross-app read path (0018).
- **ADR-0019** (Proposed) — one shared, versioned parameter store `ops.parameter` for every calibration that is
  not law; boolean switches in `@stynx-nyx/feature-flags`; catalogue in `docs/framework/arch/parameter-catalogue.md`;
  decisions of the implementation gate recorded in `docs/meta/knowledge-base/steering.md` §H.

Owner-reserved questions (ask once, lettered; never decide unilaterally): staff vs
citizen Cognito pool split, senatran-mock public mirror, RAIT statutory prazo
values, any license/visibility change, anything irreversible.
