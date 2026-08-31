# CONSTITUTION.md — pointer

`senatran-mock` is a DEVAI adopter module within the `detran` monorepo. It does
**not** carry its own copy of the constitution; the canonical, immutable axiom set
is the copy pinned at the detran repo root by DEVAI 1.4.5 and is bound by version
and digest in the root `.devai/config/project.json`
(`constitution.version`).

> Ported (W0.2) from the standalone `senatran` repo, where this pointer resolved to
> a sibling `../devai` checkout. Post-port there is no sibling devai checkout —
> `detran`'s root `.devai/pin/constitution.md` is the canonical source instead. See
> `DESIGN-DECISIONS.md` D-0012.

- Canonical source: `../.devai/pin/constitution.md` (detran monorepo root)
- Resolver pointer used by tooling: `.devai/constitution.md`
- Pinned version for this repo: **1.0.0**

Constitutional upgrade in this repo is an explicit root `devai init bind
--constitution --write` operation, never an implicit edit. Cite articles by number when a decision is governed by them
(e.g. Article 6 path-based authority, Article 23 tie-breaker ladder).
