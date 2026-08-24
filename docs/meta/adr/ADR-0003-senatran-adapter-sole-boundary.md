# ADR-0003: senatran-adapter as the Sole National-API Boundary

## Status

Accepted (owner-confirmed Decisions Ledger, 2026-08-23).

## Context

Every domain ultimately talks to SENATRAN's national systems (RENAINF, RENAEST,
RENACH, SNE, CDT, wsdenatran). In the origin repos that integration is scattered:
pec has a RENACH client with a `RENACH_PROVIDER` mock/real switch, teat wired an
integration adapter but disabled its retries, and each app talks to the mock its own
way. Real-payload schemas for the national API are low-confidence (documented in
pec's `known-gaps.md`), the mock (`senatran-mock`, 114 endpoints) is the only target
CI can exercise, and any direct app-to-SENATRAN call would fossilise Portuguese wire
DTOs and per-app auth handling across the codebase.

## Decision

`packages/senatran-adapter` is the **single sanctioned boundary** to the national
API. The dependency direction is fixed:

```
[SENATRAN-REAL] | [SENATRAN-MOCK]  ⇄  [SENATRAN-ADAPTER]  ⇄  backend  ⇄  apps
```

- **No app or backend domain module ever calls SENATRAN directly.** A repo boundary
  check (in the style of teat's `.stynxrc.json` + `verify-stynx-boundary.ts`) fails
  CI on violations.
- Typed ports per national system (renainf, renaest, renach, sne, cdt,
  wsdenatran-read — renavam-ready), exposing English domain types mapped from the
  Portuguese wire DTOs generated from senatran-mock's OpenAPI contracts.
- **`SENATRAN_PROVIDER=mock|real`** switches provider by configuration
  (generalising pec's `RENACH_PROVIDER` pattern): one client implementation,
  different base URL and auth material.
- Resilience via `@stynx-nyx/integration-adapter`: circuit breaker, timeouts,
  retries **actually enabled**, deterministic idempotency keys on writes (with
  `ALREADY_OPEN`-style recovery), and the `{returnCode,message}` error envelope
  mapped to a category taxonomy.
- Contract tests run against senatran-mock composed in CI; the real target ships
  behind per-surface feature flags until real payload schemas are confirmed.

## Consequences

- Mock⇄real switching is an ops/config concern, invisible to domains and apps; CI
  exercises the same code path production uses, differing only in provider config.
- Low-confidence real-world schemas are quarantined in one package: when the real
  API deviates, only adapter mappings change.
- senatran-mock stays a standalone service (its D-0001 exception) — the adapter,
  not the mock, owns the contract surface consumed in-repo.
- Every national-system integration inherits resilience and idempotency for free;
  bypassing them requires bypassing the boundary check, which is a red required
  check.
- The adapter is on the critical path of Phases 3–6; its port types are the
  compatibility contract that RENAVAM (`vam`) would later plug into without a new
  boundary.
