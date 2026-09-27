# Schemas

**Authority:** Architect (Constitution Article 6).

This directory contains the byte-identical JSON Schema roster shipped by DEVAI
1.5.6. [`manifest.json`](./manifest.json) records that package version and the
SHA-256 digest for each copied schema.

Domain schemas remain in the published framework corpus. See
[`docs/framework/schemas/README.md`](../../docs/framework/schemas/README.md)
for the TEAT payload and published event schemas; they are not copied here.

**Gate:** `pnpm verify:law-corpus` enforces rule (a) for the package roster,
copied bytes, and manifest hashes. DEVAI member `glob-guards` checks the schema
directory population.
