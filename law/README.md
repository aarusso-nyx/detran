# Law corpus

**Authority:** Architect (Constitution Article 6).

This directory indexes the repository's normative records and policy
references.

- [`constitution.md`](./constitution.md) contains the repository's governing
  constitution.
- [`invariants/`](./invariants/README.md) indexes the active invariant
  catalog.
- [`trace.json`](./trace.json) maps invariant records to their authority
  documents and tests.
- [`glossary/`](./glossary/README.md) indexes 44 draft `GE` entries under joint
  Owner and Architect authority; explicit Owner acceptance is still pending.
- [`schemas/`](./schemas/README.md) contains the DEVAI 1.5.6 schema roster and
  its digest manifest. Domain schemas remain indexed in
  [`docs/framework/schemas/`](../docs/framework/schemas/README.md).
- [`policy/`](./policy/README.md) indexes the adopter domain proposal, current
  local release candidate policies, mutation requirements, and authoritative
  implementation sources.
- [`adr/`](./adr/README.md) contains architecture decision records.

**Gate:** `pnpm verify:law-corpus` enforces law corpus rules (a)–(e).
DEVAI members `invariants`, `invariant-strategies`, `trace`, `glossary`,
`journeys`, `glob-guards`, and `schemas` validate their respective catalog,
trace, glossary, journey, schema roster, and adopter policy inputs.
