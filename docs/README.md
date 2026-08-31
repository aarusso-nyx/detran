# DETRAN documentation

Seven-section docs IA (DEVAI Constitution 1.0.0 layout, mirrored from teat/pec —
see `_ia/categories.json` for the authored order and labels):

1. [start/](start/index.md) — orientation: what DETRAN is and where to begin.
2. [theory/](theory/index.md) — why the suite is shaped this way.
3. [framework/](framework/index.md) — architecture, contracts, product specs, glossary.
4. [roles/](roles/index.md) — Constitution Article 6 role guides.
5. [adopters/](adopters/index.md) — guides for teams operating or integrating with the suite.
6. [reference/](reference/index.md) — generated/normative reference material.
7. [meta/](meta/index.md) — engineering docs, [ADRs](meta/adr/), operations, security.

The consolidated Docusaurus projection lives under `docs/site/`. Its
`scripts/sync-docs.mjs` command rebuilds the generated site tree from these seven
source sections and the allowlist in `_ia/categories.json`; generated content and
build output remain untracked. Run `pnpm docs:check` for sync, type, build, and
strict link validation. Publication is fail-closed by `_ia/publication.json`: intake
material, internal provenance, institutional artifacts, raw legal assets, and
draft/stub product records are excluded from the generated site.

The business/legal knowledge base is maintained here as the single writable authority:

- [framework/product/](framework/product/) — app charters, journeys, use cases, workflows,
  business rules, screens, and shared semantics.
- [reference/legal/](reference/legal/index.md) — curated legal catalog with captured originals
  retained privately in Git.
- [meta/knowledge-base/](meta/knowledge-base/index.md) — internal research, queues, templates, and
  immutable import provenance.

`docs/work/` (untracked) holds ephemeral round/working artifacts; imported research is tracked
under the knowledge-base paths and remains unpublished.
