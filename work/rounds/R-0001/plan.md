# Round 1 plan — WP-0 substrate migration and definition-round closure

**Status:** local working paper opened on 2026-09-13 to hold the evidence epoch of the
definition round (docs/rait-build-definitions) and of WP-0 (build/stynx-1-3-1).

## Goal

Adopt STYNX 1.3.1 / Angular 22 (ADR-0015, steering H.41) and close the implementation gate of
the infractions scope (steering §H.38–57) with the evidence chain intact.

## Waves

1. Definition round (Architect/Owner): five build packs, implementation gate, decision-closure
   plan, parameter catalogue (ADR-0021), Owner ballots, institutional letters, product-corpus
   propagation — commits 7d4b3eb, 6460a1e, 0d2866b, 692f8fa.
2. WP-0 (Engineer): pins 1.1.1 → 1.3.1, Angular 22 kit, feature-flags dependency, RLS contract
   split into tenant and reference tables — commits 56d5395, 101056b. Gates: `pnpm check`,
   backend unit/integration/e2e, adapter unit/integration, RLS smoke, devai doctor.
3. Next (not in this round): WP-T0 base defects, WP-D0 roles, WP-A parameter store.
