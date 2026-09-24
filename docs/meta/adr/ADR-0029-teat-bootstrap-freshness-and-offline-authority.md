# ADR-0029: TEAT bootstrap online freshness and independent offline authority

## Status

Owner decision `1A-300-E2` on 2026-09-23 for R-0013. Execution is pending; this ADR does not
certify an offline verifier or change the currently fail-closed runtime.
The Owner subsequently selected Android as the sole E2 target platform for this round and
unconditionally decided that the Gertec GMS820 meets the equipment homologation requirements.
The GMS820 is the first homologated model for this round; its homologation is not conditional on
a new model-eligibility review or a separately supplied Android/API inventory. Runtime tests,
key enrollment and per-grant cryptographic proof remain implementation and acceptance duties
for E2, not conditions that reopen the Owner's equipment-homologation decision.
ADR-0032 later fixes the E2 execution profile and its explicit 900-second status and
3600-second offline-window ceilings. This ADR's 300-second snapshot limit remains independent.

## Context

OD-T14 withheld `snapshot.maxAgeSeconds` and `snapshot.validUntil` because the origin's
hardcoded 300-second value had no catalogue source. The mobile readiness gate currently treats
`validUntil` as an unconditional deadline. Reusing 300 seconds as that deadline would stop field
work after five minutes even with a valid offline grant. Conversely, accepting the server's
`offlineReady` boolean or an unverified package signature after the snapshot ages out would grant
authority without local proof.

## Decision

1. `teat.bootstrap.snapshot_max_age_seconds` is a tenant-scoped TEAT integer parameter, initially
   300 seconds, with no agency override. It is `vigente`, not source-pending, not legal-readonly,
   and linked to OD-T14. A future agency-scoped row must not override it without a new Owner
   decision. This is an operational calibration, not a claimed legal limit. Its operational
   effective date is the activation of its catalogue/parameter row, which may be later than the
   Owner's 2026-09-23 decision; the fixture seed must not backdate it to either the original
   2026-09-13 catalogue seed or an earlier decision date.
2. A valid parameter gives the backend snapshot `maxAgeSeconds: 300` and
   `validUntil: capturedAt + 300 seconds` in UTC. Missing, pending, non-integer, non-positive or
   otherwise invalid data must fail closed; no code constant substitutes for the parameter.
3. That deadline governs **online freshness**. At or after it, offline operation is permitted only
   after local verification of the current tenant/agent/device/shift-scoped grant, unexpired
   numbering reservation and integrity-verified exact normative package, with no known blocker.
   The verifier must use trusted key material and bind scope, issue/expiry, revocation knowledge
   and relevant package/reservation identities; a cached `offlineReady` flag, local encryption,
   non-empty signature string or `local-unsigned` marker is not proof. At the time of this ADR,
   ADR-0028 left JOSE/COSE format, trusted signing and attestation policy `source_pending`;
   OD-T16 likewise lacked a normative-package signature. ADR-0032 subsequently fixes the
   Android/GMS820 policy profile, while production keys, ports and verification remain pending.
4. If any proof is absent, invalid, expired, unverifiable or contradicted by known state, block.
   Before the verifier is implemented and tested, keep the existing strict mobile gate and do not
   claim E2 functional. Aged snapshots do not silently extend grant or reservation validity or
   remove normative-package integrity checks. ADR-0031 records the subsequent Owner decision:
   an expired but identity- and signature-verified normative package produces a visible,
   recorded warning under E2, not an expiration-only blocker. Missing, mismatched, tampered or
   known-revoked packages still block. This package rule derives from steering E.29; H.55 is
   the separate warn-and-record rule for expired software homologation.

## Consequences

The bootstrap schema and route contract must distinguish online freshness from offline authority.
Backend parameter lookup, seed activation, mobile verifier/gate, positive and negative tests and
independent review are required before marking OD-T14 implemented. The strict mobile denial
after online expiry remains the safe interim state until local proof is implemented. This decision does not settle the
separate AIT aggregate-validation matrix (Owner choice 2A).
