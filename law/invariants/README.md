# Invariants

**Authority:** Architect (Constitution Article 6).

This catalog contains the active invariants transcribed from approved contracts. ADR-0056 adds source-bound shared guard (`INV-RBAC-001`) and error-helper (`INV-API-001`) obligations without changing existing invariants. The two new producers reuse complete existing suites; the 729 policy cases overlap DASH/RBAC and are not additional distinct tests. Each `INV-*.json` file is the canonical record for its invariant, and `VERSION` records the catalog version. Trace mappings are maintained in `law/trace.json`.

**Gate:** `pnpm verify:law-corpus` enforces rule (b) for provenance and
authority references. DEVAI members `invariants`, `invariant-strategies`, and
`trace` validate the catalog, readiness strategy, and trace mappings.
