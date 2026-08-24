/**
 * Placeholder composition root for the unified DETRAN backend.
 *
 * Phase 2 (W2.1) replaces this with the real NestJS composition root:
 * stynx adapter kernel (the 8 adapter hooks, shaped like pec's
 * apps/api/src/stynx-runtime.ts), teat's fail-closed runtime profiles,
 * the unified policy matrix, request-path tenancy enforcement
 * (withTenantContext) and the DB-persisted audit sink.
 *
 * See docs/meta/adr/ADR-0002-unified-backend-modular-monolith.md.
 */
export const DETRAN_BACKEND_PLACEHOLDER = true;
