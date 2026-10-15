# ADR-0011: Phase 6 documentation and publication capability

## Status

Accepted on 2026-08-31. The Owner authorized advancing the independently bounded
W6.3 documentation capability on the current DEVAI/STYNX upgrade worktree. This
does not close the remaining Phase 6 domain-port, parity, retirement, or archive
work.

## Context

DETRAN already had an authored seven-section documentation tree and information-
architecture manifest, but no `docs/site/` implementation. DEVAI 1.4.5 therefore
reported missing Docusaurus shape and Constitution publication failures. The
remote repository had neither a configured GitHub Pages site nor a `gh-pages`
branch.

The historical root `CONSTITUTION.md` contains DEVAI Constitution 0.3.0. The
active binding is the immutable Constitution 1.0.0 copy at
`.devai/pin/constitution.md`, whose digest is recorded in
`.devai/config/project.json`. Publishing the root historical file as current law
would be an authority error.

## Decision

1. `docs/site/` is the tracked Docusaurus source. It pins Docusaurus 3.10.2 and
   uses an npm lockfile independently from the pnpm application workspace.
2. `docs/site/scripts/sync-docs.mjs` deterministically rebuilds the ignored site
   projection from the seven canonical `docs/` sections and
   `docs/_ia/categories.json`. Markdown links are rewritten to their published
   destinations; non-document assets are served under `docs-assets/`; missing
   allowlisted sources and target collisions fail closed. The projection also
   enforces `docs/_ia/publication.json`: intake material, internal provenance,
   institutional artifacts, raw legal assets, and draft/stub product records are
   excluded. Authored frontmatter is preserved as visible source metadata while
   only projection-controlled frontmatter can affect Docusaurus routing.
3. The sidebar preserves the manifest's explicit seven-section order. Generated
   `docs/site/docs`, `.docusaurus`, `build`, `node_modules`, and copied static
   documentation assets remain untracked.
4. The active `.devai/pin/constitution.md` is published as
   `framework/constitution-text.md`, while `docs/reference/law.md` publishes the
   binding identity and digest. The historical root `CONSTITUTION.md` is not
   projected as active law.
5. Site builds fail on broken links, anchors, or images. The required `foundation`
   CI job installs the locked site dependencies, runs the site type/build/link
   gate, runs the dependency security gate, and then runs DEVAI doctor as a
   blocking check. CI never publishes documentation.
6. Transitive Docusaurus dependencies affected by advisories that upstream has
   not fixed in a published release are closed by vendoring a patched copy of
   the exact published package surface under `docs/site/vendor/`, bound through
   `file:` dependencies and `overrides`. A guard script verifies the patched
   identity, the reviewed fix source and the runtime behaviour before every
   documentation audit (`security:check`). Each vendored patch is dropped once
   upstream publishes a release carrying the fix or the advisory is withdrawn
   from the GitHub Advisory Database. Two patches are in force:
   - `image-size@2.0.3-devai.1` (`docs/site/vendor/image-size`, guard
     `docs/site/scripts/check-image-size-patch.mjs`) reuses the exact
     DEVAI-v1.4.5-reviewed patch (source tree
     `6fdece3d46e6a3677bd00da9f49cb2e5adf8a73c`) against the ICNS/JXL/HEIF
     denial-of-service advisories.
   - `braces@3.0.3-devai.1` (`docs/site/vendor/braces`, guard
     `docs/site/scripts/check-braces-patch.mjs`; **amended 2026-10-15**, commit
     `9fa230e8`, aarusso-nyx/detran#181) vendors the published `braces` 3.0.3
     surface with a parser nesting-depth guard (`MAX_DEPTH` 100, controlled
     `SyntaxError`, mirroring micromatch/braces#89) for GHSA-vfj7-8cjw-p6xm /
     CVE-2026-93687, because upstream disputes the advisory and has published no
     fixed release. Provenance is recorded in
     `docs/site/vendor/braces/DEVAI-PATCH.md`.
7. The publication identity is `https://aarusso-nyx.github.io/detran/` from the
   `gh-pages` branch. First and subsequent deployments are explicit local effects
   from an accepted exact tree; no Actions workflow receives publish authority.

## Consequences

Documentation sources remain reviewable beside code and law while the published
tree is reproducibly generated. The current Constitution is both human-readable
and digest-bound, and the obsolete root text cannot silently replace it. The
existing required `foundation` check now blocks on documentation, dependency
security, and DEVAI adoption health.

Pages creation changes remote state and is performed only after the PR-only
integration gate accepts this exact candidate. Documentation version snapshots
are added only when DETRAN declares a documentation release version; no artificial
history is fabricated for the first publication.
