# backend/domains/est — Sinistros (RENAEST)

Domain packages for crash/accident records and sinistro analytics.

- Populated in Phase 5 (W5.1): teat's `crash.*` DDL and `crash-crash-records` domain move
  here; BOAT (apps/boat/mobile) is its primary producer.
- Each module is a real pnpm workspace package with explicit deps (ADR-0001, ADR-0002).
