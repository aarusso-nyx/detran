# DEVAI Constitution (published stub)

This page is the published-documentation stub for the DEVAI Constitution that
governs `senatran-mock`. The module does not carry its own copy of the axiom set;
the canonical source is the `detran` monorepo root's vendored copy, pinned by
version (post-port; the standalone `senatran` repo pointed at a sibling `../devai`
checkout instead — see `DESIGN-DECISIONS.md` D-0012).

- Canonical source: `../../../CONSTITUTION.md` (detran monorepo root)
- Pinned version: **0.3.0** (see `.devai/config/project.json` → `constitution.version`)
- Root pointer: [`CONSTITUTION.md`](../../CONSTITUTION.md)

Constitutional upgrades are explicit `devai upgrade` operations, never implicit
edits.
