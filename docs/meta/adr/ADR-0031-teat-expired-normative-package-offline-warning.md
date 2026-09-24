# ADR-0031: Expired TEAT normative package remains a warning under E2

## Status

Owner approved on 2026-09-23 for R-0013. This confirms steering E.29 for the E2 offline
authority path. H.55 is a separate, analogous warn-and-record decision for expired SENATRAN
software homologation; it is not the source of the normative-package rule.

## Context

WF-TEAT-003 records the E.29 decision to continue issuing AITs in the field when the
installed normative package expires without connectivity, with a visible warning. The
current mobile package service returns `warning-expired`, while ADR-0029 left open whether
E2 would impose a stricter expiration blocker. E2 also requires local proof of the exact
package's identity and integrity. An expired deadline is not evidence that an absent,
tampered, unknown or revoked package is safe.

## Decision

For an installed normative package whose exact identity, version, manifest digest and
trusted signature have been verified, passing `validUntil` alone produces a visible,
recorded warning and does not block E2 offline action. The warning and package identity
must accompany the AIT/evidence and reach backend reconciliation for authority review.
Missing, mismatched, unverifiable, tampered or known-revoked packages still block; no
`local-unsigned` fixture or non-empty signature string counts as trusted proof. All other
grant, reservation, shift, revocation and offline-window requirements remain blocking.

This decision sets no new grace period and does not extend the package's validity or
override withdrawal/revocation. It resolves only the expiration warning, not the pending
cryptographic profile, trust distribution, time source, or executable AIT validation matrix.

## Consequences

Inspector must cover the expired-but-verified positive warning and the missing,
tampered, mismatched and known-revoked negatives. Engineer must preserve the warning in
local records and reconciliation, not turn it into an authorization bypass. The current
strict gate after the online snapshot expires remains until E2 verification is real.
