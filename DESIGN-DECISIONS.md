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
- **ADR-0006** — Shared DETRAN Angular UI kit over STYNX.
- **ADR-0006** — Field-operations port scope and offline-sync deferral.
- **ADR-0007** — Blueprint JSON is the sole authority for generated backend
  scaffolds and numbered domain DDL.
- **ADR-0008** — SENATRAN provider configuration, English ports, feature flags,
  resilience and generated wire contracts.
- **ADR-0009** — OpenAPI contracts are generated from blueprints.
- **ADR-0010** — `detran/docs` is the single writable authority for the
  business/legal knowledge base; source provenance is immutable, and publication
  is status-gated and fail-closed.
- **ADR-0011** — PEC auth, audit and integration concepts map onto the unified
  kernel, `ch` domain records and the sole SENATRAN adapter without parallel
  infrastructure.

Owner-reserved questions (ask once, lettered; never decide unilaterally): staff vs
citizen Cognito pool split, senatran-mock public mirror, RAIT statutory prazo
values, any license/visibility change, anything irreversible.
