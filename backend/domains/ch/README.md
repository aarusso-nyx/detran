# backend/domains/ch — Condutor/Habilitação (RENACH)

Domain packages for driver/licensing processes: pec's 29 domain modules, repackaged.

- Populated in Phase 6 (W6.1–W6.2) — the largest port with the lowest coupling, hence
  last. pec keeps running from its own repo until then; PORTAL's CNH views use the
  senatran-adapter CDT port, not pec internals.
- Each module is a real pnpm workspace package with explicit deps (ADR-0001, ADR-0002).
