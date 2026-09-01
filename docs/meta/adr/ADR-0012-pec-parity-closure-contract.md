# ADR-0012: PEC Parity Closure Contract

## Status

Accepted by the Owner on 2026-08-31.

## Context

The first PEC port increment reproduced the origin's implemented behavior while exposing four
incompatible completion conditions: DT-025 retained a signer-reassignment shortcut that
contradicted the reviewed three-instance Junta design; DT-024 put periodic toxicology in scope
without an approved event model; a literal 611-spec-file threshold rewarded generated wrappers
and `it.todo` placeholders; and production session/signing claims depended on external services
whose fail-closed contract had not been bound.

The Owner approved reconciliation of all four. This ADR records the implementation boundary; it
does not treat local mocks as evidence that a production Redis, identity provider, TSA,
certificate chain or revocation responder exists.

## Decision

1. The target models a candidate request, medical or psychological board, formal appeal,
   CETRAN designation, distinct Junta Especial de Saúde, board membership and independently
   signed decisions. CETRAN designates; it is not substituted for the technical collegiate body.
   Only sourced deadlines are calculated.
2. Periodic toxicology is an authenticated and idempotent RENACH inbound event through
   `@detran/senatran-adapter`. The event creates an immutable `ch` result rather than a fabricated
   encounter. A valid positive C/D/E result creates a three-month suspension; a later valid
   negative result or sourced expiry releases it without rewriting history. SENATRAN retains the
   statutory alert duty. Invalid or unmatched events become audited exceptions.
3. PEC parity is measured by executable behavior: every reviewed `AC-PEC-*` has target-test
   evidence, every origin spec has a validated disposition with evidence, no acceptance blocker
   remains, and all unit, integration, API, contract, blueprint, RLS and boundary gates pass.
   Deferred or blocked behavioral specs keep the verdict fail-closed.
4. Outside local/test profiles, STYNX sessions require Redis and secret-resolved RSA signing
   material. Session creation and tenant switching require a verified strong factor; replacement
   revokes any prior active session for the same user and tenant; refresh reuse, revocation and
   expiry remain enforced by STYNX.
5. Clinical signing remains an external PAdES/TSA/revocation trust service. Non-local readiness
   requires HTTPS configuration, injected credentials and a successful capability probe. Local
   contract tests may validate failure behavior and receipts, but production readiness requires
   deployment evidence from the real providers.

All new `ch` persistence remains blueprint-generated, tenant-scoped and forced-RLS. RENACH wire
contracts remain confined to the SENATRAN adapter, and application orchestration may not create a
second identity, session, audit or transport framework.

## Consequences

- The legacy `escalateToCetran` behavior is superseded rather than copied.
- Toxicology results, suspensions and exceptions have durable provenance and replay protection.
- The parity report can reach implementation parity without manufacturing inert spec files, but
  cannot claim production-provider readiness until deployment evidence is supplied.
- Missing Redis, secret signing material, strong-factor evidence, HTTPS trust endpoints or trust
  capabilities fail closed in non-local profiles.
