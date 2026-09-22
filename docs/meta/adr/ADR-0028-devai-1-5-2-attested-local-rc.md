# ADR-0028: Adopt DEVAI 1.5.6 for attested local RC evidence

## Status

Accepted on 2026-09-22 by the Owner.

## Context

The R-0007 backend closure is expensive in GitHub Actions but reproducible on the Owner's trusted
workstation. DEVAI 1.4.5 provides the protected-tag trusted-local-RC contract, but its standalone
policy builder buffers every tracked blob in one `git cat-file --batch` call. This repository has
about 130 MiB of tracked blob content, so independent export and remote reconstruction fail at the
64 MiB process buffer even when the same RC task succeeds.

DEVAI 1.5.1 introduced deterministic reconstruction and corrected the protected verifier payload;
DEVAI 1.5.2 adopted that verifier through the official workflow generator. DEVAI 1.5.3 completes
the correction by bounding the committed-snapshot `git cat-file --batch` reconstruction, so this
repository's tracked blob population no longer exceeds the child-process output buffer. The
generated workflow continues to pin verifier package, source identity and provenance independently.
DEVAI 1.5.4 additionally preserves the empty-artifact snapshot while publishing a zero-artifact
evidence bundle. DEVAI 1.5.5 promotes that corrected 1.5.4 verifier into the protected workflow and
proves the bundle after Git materializes the proof checkout without an empty `artifacts/` directory,
but the checkout-owned `.git` directory still entered the strict population input. DEVAI 1.5.6
materializes the exact proof commit as a clean inert payload before verification, excluding only Git
administration while preserving rejection of undeclared ordinary files and parseable failure output.

## Decision

1. Pin `@aarusso-nyx/devai` 1.5.6 and keep Constitution 1.0.0 unchanged.
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

## Activation preparation

The first local attempt after DEVAI 1.5.3 reached `main` exposed a readiness race in the local
harness: `pg_isready` could observe the temporary initialization server immediately before the
container stopped it and started the final PostgreSQL server. The harness now waits for the
entrypoint's initialization-complete marker before accepting readiness.

Because the harness is a protected control surface, this correction must merge through the full
remote fallback and is not activation evidence. A subsequent candidate that leaves protected
surfaces unchanged may merge only when its exact commit and tree produce a signed local RC bundle,
the protected verifier reports `verified-local-rc=success`, and the ordinary remote checks that
remain mandatory are green. That later result satisfies decision 5 above without broadening the
set of locally replaceable jobs.
