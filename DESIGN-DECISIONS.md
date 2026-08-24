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

Owner-reserved questions (ask once, lettered; never decide unilaterally): staff vs
citizen Cognito pool split, senatran-mock public mirror, RAIT statutory prazo
values, any license/visibility change, anything irreversible.
