# ADR-0028: Adopt DEVAI 1.5.2 for attested local RC evidence

## Status

Accepted on 2026-09-21 by the Owner.

## Context

The R-0007 backend closure is expensive in GitHub Actions but reproducible on the Owner's trusted
workstation. DEVAI 1.4.5 provides the protected-tag trusted-local-RC contract, but its standalone
policy builder buffers every tracked blob in one `git cat-file --batch` call. This repository has
about 130 MiB of tracked blob content, so independent export and remote reconstruction fail at the
64 MiB process buffer even when the same RC task succeeds.

DEVAI 1.5.1 introduced deterministic bounded reconstruction and corrected the protected verifier
payload. DEVAI 1.5.2 adopts that corrected verifier through the official workflow generator and
keeps its package, source identity and provenance independently pinned in the generated workflow.

## Decision

1. Pin `@aarusso-nyx/devai` 1.5.2 and keep Constitution 1.0.0 unchanged.
2. Enable `ci_economy.attested_rc` only for `backend-kernel`, using exact-tree protected-tag
   binding, the single `owner-aarusso-nyx` Ed25519 signer and fail-closed verification.
3. Keep `foundation`, `evidence-gate`, `senatran-mock` and `senatran-mock-tests` remote.
4. Preserve the complete remote backend fallback whenever no eligible evidence tag exists or a
   protected control surface changes. A present invalid tag blocks; it never falls back.
5. Replace the required `backend-kernel` context with `verified-local-rc` only after the protected
   workflow is on `main` and one real candidate proves the remote fallback or attested route.

## Consequences

- The workstation execution is trusted through signer identity, exact candidate/tree binding,
  protected toolchain and environment identities, and complete signed results; GitHub does not
  independently reproduce product commands on the attested route.
- Revoking the signer or restoring `backend-kernel` as a required check disables the economy path
  without weakening the remaining gates.
- Extending local evidence to another job requires a separate Owner decision.
