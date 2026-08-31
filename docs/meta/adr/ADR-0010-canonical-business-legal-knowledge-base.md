# ADR-0010: Canonical Business and Legal Knowledge Base

## Status

Accepted (Owner-authorized consolidation, 2026-08-31).

## Context

The business and legal knowledge that drives DETRAN product behavior was maintained in the
private companion repository `aarusso-nyx/detran-refs`. The monorepo contained only selected
handoffs, often pinned to older source commits, so engineering depended on a sibling checkout to
resolve full rules, workflows, legal citations, open questions, and research provenance. That
split allowed authority and summaries to drift and could not support the planned consolidated
documentation site without a second synchronization mechanism.

The approved cutover snapshot is commit
`aa276b8e71866bfa9e012b23ee4a14b6fc6720a3` from `main`. It contains 620 tracked files and
passes the source corpus checker with 473 artifact identifiers and 383 canonical workflow tokens.

## Decision

1. `detran/docs` is the single writable authority for DETRAN business semantics, product
   workflows, legal annotations, and their research provenance. No authoring or runtime process
   may require a sibling `detran-refs` checkout after cutover.
2. The selected snapshot is imported without Git history into the existing seven-section docs
   information architecture. The immutable source repository and commit remain provenance; the
   complete source-to-destination and SHA-256 inventory is recorded in
   `docs/meta/knowledge-base/import-manifest.json`.
3. Product artifacts retain their source maturity unchanged. `stub` and `draft` material remains
   non-binding; import does not promote it or convert Owner decisions into legal approval.
4. All captured research and source material remains tracked in the private monorepo, but site
   publication is fail-closed. Product pages require `reviewed` or `approved`; legal pages require
   presence in the curated legal catalog; raw legal files, intake research, internal queues,
   session artifacts, and institutional deliverables are not published by default.
5. `pnpm docs:kb:check` enforces corpus integrity, links, provenance, and publication policy.
   `pnpm docs:kb:publish-check` creates an ignored dry-run publication tree and proves excluded
   classes do not leak.
6. There is no subtree, submodule, LFS migration, reverse synchronization, or dual-authority
   period. Future edits land only in DETRAN after cutover.
7. The source repository is archived, not deleted, only after the import PR merges and the exact
   merged tree passes post-merge validation. Archiving is a separately approved administrative
   action.

## Consequences

- Product, engineering, and legal-reference readers resolve the complete current corpus inside
  one governed repository, while historical source hashes remain auditable.
- The monorepo grows by roughly 100 MiB because source originals are tracked as ordinary Git
  objects. They remain private and are not copied into the future site unless publication policy
  is explicitly changed after rights review.
- Existing decision and security handoffs remain useful engineering projections, but they link to
  in-repository canonical artifacts and cannot supersede those artifacts.
- Any future public release of captured third-party documents requires a separate licensing and
  rights decision.
