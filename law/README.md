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
- [`glossary/`](./glossary/README.md) is the glossary index; its corpus is
  pending CTG-0002.
- [`schemas/`](./schemas/README.md) contains the DEVAI 1.5.6 schema roster and
  its digest manifest. Domain schemas remain indexed in
  [`docs/framework/schemas/`](../docs/framework/schemas/README.md).
- [`policy/`](./policy/README.md) indexes the adopter domain proposal, current
  local release candidate policies, mutation requirements, and authoritative
  implementation sources.
- [`adr/`](./adr/README.md) contains architecture decision records.

**Gate:** `pnpm verify:law-corpus` enforces law corpus rules (a), (b), and (e).
DEVAI members `invariants`, `invariant-strategies`, `trace`, `glob-guards`, and
`schemas` validate their respective catalog, trace, schema roster, and adopter
policy inputs.
