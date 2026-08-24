# ADR-0008: SENATRAN Port, Provider and Feature-Flag Design

## Status

Accepted for Phase 2 implementation (W2.2, derived from the owner-confirmed
Decisions Ledger and ADR-0003; 2026-08-24).

## Context

ADR-0003 establishes one national-API boundary, but the implementation still
needs to reconcile three different confidence levels: the in-repo mock contracts
are executable and authoritative for CI, the PEC RENACH client contributes a
proven provider-switch and duplicate-process recovery pattern, and real SENATRAN
payload/auth details remain certificate-gated and low-confidence. Exposing
Portuguese DTOs or base/auth configuration to domains would make those domains
responsible for future wire corrections and would weaken the sole-boundary rule.

The read and transactional OpenAPI files each currently describe 57 operations.
The read surface includes vehicle data that can support a future RENAVAM domain,
but `vam` is explicitly reserved and must not be built in this phase.

## Decision

1. `@detran/senatran-adapter` exports six English, domain-facing ports:
   `RenainfPort`, `RenaestPort`, `RenachPort`, `SnePort`, `CdtPort` and
   `WsdenatranReadPort`. The WSDenatran port also exposes exact generated typing
   for every read path, making it RENAVAM-ready without creating a RENAVAM
   domain or claiming a validated real RENAVAM contract.
2. `openapi-typescript@7.13.0` generates wire types from both committed mock
   contracts. Generation asserts 57 operations per file and a drift check runs
   in `pnpm check`. Portuguese generated DTOs are exported only through the
   explicit `./wire` subpath; hand-written mappers define the public English
   contract.
3. A single framework-free `SenatranClient` serves `mock` and `real`. Provider
   configuration changes its base URL and authentication material, not its HTTP
   execution logic. Mock mode uses the CPF and certificate-CN simulation
   headers. Real mode requires operator CPF plus certificate/key mTLS material,
   verifies the server certificate and never emits the simulation CN header.
4. Mock surfaces are enabled by default, except reserved `renavam`. Every real
   surface is fail-closed behind its own `SENATRAN_REAL_ENABLE_*` flag. Real base,
   operator and mTLS configuration are mandatory even before a real call can be
   constructed. There is no working RENAVAM real flag in this phase.
5. Calls execute through pinned `@stynx-nyx/integration-adapter@0.5.0`: default
   timeout 10 seconds; three attempts with bounded backoff and jitter; circuit
   breaker keyed by provider, surface and tenant; telemetry hook on every
   lifecycle phase. Only provider/network failures retry. The provider error
   envelope maps to `VALIDATION`, `AUTH`, `NOT_FOUND`, `PROVIDER` or `BUSINESS`.
6. Every write carries a deterministic, SHA-256-derived `Idempotency-Key` scoped
   to its surface and operation. `RenachPort.openProcess` preserves PEC's
   `ALREADY_OPEN` recovery: on the precise provider business code it queries the
   existing active process and returns it as `ALREADY_OPEN`; all other errors
   retain their taxonomy.
7. `tools/verify-senatran-boundary.ts` scans runtime code under `apps`, `backend`
   and `packages` (excluding the adapter itself) for national base-URL variables,
   auth headers and direct national HTTP hosts. It is part of root `pnpm check`
   and the required `backend-kernel` job. CI boots the in-repo mock against its
   own seeded database and runs the adapter e2e contract tier in that job.
8. The exported test kit mirrors the tracked seed manifest: auth fixtures, magic
   keys, stable identifiers, manifest validation and lookup helpers. Unit,
   integration, e2e/mock and real/homologation tiers share behavior where the
   target supplies approved fixtures. The real tier is skipped unless explicitly
   authorized with credentials and fixture inputs.

## Consequences

- Domains see stable English concepts while generated Portuguese contracts stay
  mechanically traceable to all 114 mock operations.
- Mock and production exercise one request/resilience implementation; provider
  switching cannot silently broaden the real surface.
- Retry, circuit, idempotency and error semantics are uniform across every
  national system, including future ports implemented inside this package.
- Process-local idempotency caching is suitable for one adapter instance and
  provider replay protection; durable cross-process workflow deduplication
  remains the responsibility of the backend idempotency/outbox infrastructure.
- Real-target credentials, certificate provisioning, payload confirmation and
  homologation evidence remain explicit TODOs. A surface flag is not enabled
  merely because the mock contract passes.
