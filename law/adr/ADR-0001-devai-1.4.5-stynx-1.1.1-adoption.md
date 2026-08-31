# ADR-0001: Adopt DEVAI 1.4.5 and unified STYNX 1.1.1

## Status

Accepted on 2026-08-31 for the governed dependency-adoption round.

## Context

DETRAN was still bound to the retired `@devai-nyx/cli@^0.3.0`, DEVAI
Constitution 0.3.0, and a mixed set of exact STYNX releases spanning 0.5.0 to
1.1.0. The stable registry targets are `@aarusso-nyx/devai@1.4.5` and the
unified `@stynx-nyx/*@1.1.1` release. The latter was published from STYNX commit
`75f8d49fba0f2418c310b62d98f50f796a33002e` and tree
`c526b93ef26bc5f9946dba19749a5268b9d2abff`.

The old DEVAI evidence chain at `.devai/state/evidence-chain.json` contains
genesis and historical phase evidence. DEVAI 1.4.5 uses
`record/proofs/chain.json` and explicitly provides no legacy-chain migration or
fallback.

## Decision

1. Pin `@aarusso-nyx/devai` exactly at 1.4.5 and bind DETRAN as the existing
   tier-3 runtime host. The active Constitution is version 1.0.0 at
   `.devai/pin/constitution.md`, with its digest in
   `.devai/config/project.json`.
2. Pin every consumed `@stynx-nyx/*` dependency exactly at 1.1.1, including
   backend, domain, Angular UI, and SENATRAN integration-adapter packages. The
   blueprint generator owns the domain-package pins.
3. Preserve `.devai/state/evidence-chain.json` unchanged as historical evidence.
   New DEVAI evidence begins with the package-created
   `record/proofs/chain.json`; no record is fabricated or translated.
4. Update the existing `evidence-gate` job to verify the DEVAI 1.4.5 proof chain
   through `devai evidence verify`. This changes the verifier command only; job
   name, branch-protection surface, permissions, and the non-skipping
   `evidence_mode: false` behavior remain unchanged.
5. Retain DETRAN's narrow tenancy-interceptor ordering shim. A controlled A/B
   HTTP-pipeline E2E with STYNX 1.1.1 returned HTTP 500 without the shim and HTTP
   200 with it, so removing it would regress the current runtime contract.
6. Do not install new host adapters, alter repository secrets or variables,
   publish documentation, or change branch protection in this adoption round.

## Consequences

DETRAN consumes the current stable DEVAI and STYNX package lines from immutable
lockfile resolutions. DEVAI package/policy/Constitution binding can be checked
independently from the preserved legacy evidence. The pre-existing root
Docusaurus-site gap remains an advisory `devai doctor` finding until its planned
documentation-site phase; it is not represented as a passing adoption gate.
