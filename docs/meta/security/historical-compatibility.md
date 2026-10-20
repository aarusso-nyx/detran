# Historical compatibility and additive errata map

Architect compatibility design for C8. Source diagnostics were captured at
`2df548e0ac5227abb64b66994f675dea7ba36a5a`; they are observations of that tree,
not fresh verdicts for this document's candidate. The full source captures and hashes
are in [the R-0041 source captures](../../../work/rounds/R-0041/reports/c8-compatibility/).

## Binding entrypoint erratum

The previous `law/constitution.md` ended with this historical information:

> The legacy root `CONSTITUTION.md` is preserved as historical genesis evidence and is not the active binding.

That information remains true and is preserved here. The reading-order entrypoint now
matches the installed canonical body exactly. Constitution 1.0.2 and SHA-256
`d7f8791f1d00a7247bced66bdcdf8b1af431bb57e49d03b6ddd7024cb52f957d` remain unchanged;
neither the genesis source nor the vendored pin was rewritten.

## Native historical findings and dispositions

The schema-adoption ADR is authentic historical prose: its own recorded decision preserves
both evidence chains and explicitly rejects fabricated translation. Missing YAML frontmatter
is a format compatibility finding, not proof that the decision never existed. Its original
bytes remain the source; this index supplies no retroactive signature or authority.

| Source control              | Observed result | Finding population                                                                  | Disposition                                                             |
| --------------------------- | --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `decision_record_integrity` | FAIL            | DECISION_FRONTMATTER_INVALID=1                                                      | Preserve native verdict; interpret only within its declared population. |
| `round_record_integrity`    | FAIL            | ROUND_RECORD_MISSING=14, ROUND_PHASE_CLOSURE_UNRESOLVED=19, ROUND_ARCHIVE_MUTATED=1 | Preserve native verdict; interpret only within its declared population. |
| `archive_immutability`      | PASS            | No findings                                                                         | Preserve native verdict; interpret only within its declared population. |

A PASS from `archive_immutability` does not erase `ROUND_ARCHIVE_MUTATED` from the
round-record checker. The controls examine different predicates. The latter names R-0017;
its first-closed-tree delta needs source/commit-level review, not suppression. Missing
`record.md` does not permit inventing one. Closure strings unresolved by a path/format
predicate do not authorize reconstructing a PC document.

## Exact finding index

The following is a forward index into the frozen source findings, preserving their text:

### decision_record_integrity

Source capture SHA-256: `24a6fb953fa57aba5bf7c192b655279df073910b23e7887c085651eaa527e355`.

- `DECISION_FRONTMATTER_INVALID` — law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md: frontmatter is required

### round_record_integrity

Source capture SHA-256: `eaa0858006ea829e396c25a52ea50cc35ac58d3090a6b15eddfbb471e5dba9bc`.

- `ROUND_RECORD_MISSING` — R-0001 has no record.md.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0003 cites missing phase closure PC-0001.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0004 cites missing phase closure PC-0002.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0005 cites missing phase closure PC-0003.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0006 cites missing phase closure PC-0004.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0007 cites missing phase closure PC-0011.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0008 cites missing phase closure PC-0005.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0009 cites missing phase closure PC-0006.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0010 cites missing phase closure PC-0008.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0011 cites missing phase closure PC-0009.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0012 cites missing phase closure PC-0010.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0013 cites missing phase closure PC-0013.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0014 cites missing phase closure PC-0007.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0015 cites missing phase closure PC-0014.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0016 cites missing phase closure PC-0012.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0017 cites missing phase closure PC-0018.
- `ROUND_ARCHIVE_MUTATED` — R-0017 changed after its first closed commit.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0018 cites missing phase closure PC-0020.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0019 cites missing phase closure PC-0016.
- `ROUND_RECORD_MISSING` — R-0020 has no record.md.
- `ROUND_RECORD_MISSING` — R-0021 has no record.md.
- `ROUND_RECORD_MISSING` — R-0022 has no record.md.
- `ROUND_RECORD_MISSING` — R-0023 has no record.md.
- `ROUND_RECORD_MISSING` — R-0024 has no record.md.
- `ROUND_RECORD_MISSING` — R-0025 has no record.md.
- `ROUND_RECORD_MISSING` — R-0026 has no record.md.
- `ROUND_RECORD_MISSING` — R-0027 has no record.md.
- `ROUND_RECORD_MISSING` — R-0028 has no record.md.
- `ROUND_RECORD_MISSING` — R-0029 has no record.md.
- `ROUND_RECORD_MISSING` — R-0030 has no record.md.
- `ROUND_RECORD_MISSING` — R-0031 has no record.md.
- `ROUND_RECORD_MISSING` — R-0032 has no record.md.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0033 cites missing phase closure PC-0021.
- `ROUND_PHASE_CLOSURE_UNRESOLVED` — R-0036 cites missing phase closure PC-0022.

### archive_immutability

Source capture SHA-256: `177da236750251c3cb9244162f44049bf62943d65577b63dd8e4dc33037a699f`.

No findings in this captured population.

## Forward-only compatibility protocol

1. Identify an exact source path, original Git object/commit and SHA-256 before classifying
   a legacy finding. Preserve both governed and legacy chains; never rechain old proofs.
2. Distinguish an authentic recoverable source, an unsupported legacy shape and an actual
   absence. Keep missing authorship, dates, signatures and PC records explicitly unknown.
3. Add a new erratum/compatibility entry linking the old hash and authentic authority.
   Do not overwrite a closed round, historical ADR, proof, closure, timestamp or verdict.
4. A future compatibility reader must have a narrow versioned mapping with source hashes;
   it must reject changed bytes, unexplained new records and mismatched identities. Negative
   tampering cases must accompany any implementation. No blanket legacy exemption follows.
5. Native integrity FAIL/REVIEW remains until an approved provider mechanism can consume
   this additive representation. This document alone is not that mechanism or a PASS.

## Boundaries and remaining work

This C8 delivery includes the approved additive design, source index and a supplementary source-hash verifier. The structured map is [historical-compatibility.json](historical-compatibility.json); `node tools/security/verify-historical-compatibility.mjs` validates the original Git sources, current preserved bytes and recorded gaps. It emits no native readings and replaces no native verdict. The installed provider has not demonstrated a supported binding
for these compatibility entries. An implementation or release in a sibling repository
requires a separately scoped provider task; DETRAN validators continue unchanged.

## Scoped schema-citation census

The [complete working capture](../../../work/rounds/R-0041/reports/schema-citation-census/working-census-v2.json)
now inventories concrete ADR-ID occurrences across the declared tracked `law/schemas/**/*.json`
population, including root files and case-insensitive `.json` suffixes. The [custody manifest](../../../work/rounds/R-0041/reports/schema-citation-census/custody-v2.json)
records source base `c995a8c846e811a6611994f022a25dd1c6cd482c`, tool SHA-256
`6853ef23dab1c26fce488cdaadb986d266b4c6dd997ce3dd59b33577ae4ba4dd`, exact capture bytes,
and each input's comparison with that base Git object. All 122 input hashes match the
base. All 122 worktree inputs also match their index blobs. The selector takes the tracked
index population and hashes actual worktree bytes; index equality alone is not a commit
witness. The custody comparison separately binds the captured input bytes to the base.
Root ran the working source against the working tree; this is a diagnostic capture, not a
frozen-candidate execution or a native reading.

| Declared population / observed context               |    Count |
| ---------------------------------------------------- | -------: |
| Tracked JSON files                                   |      122 |
| Schema files / manifest files                        |  121 / 1 |
| Concrete occurrences / unique reference strings      | 138 / 47 |
| Annotation-value occurrences                         |       96 |
| Data-keyword-value occurrences                       |       42 |
| `ADR-014` occurrences, within root `examples` arrays |        6 |

Every one of the 138 rows remains observable with source-byte hash, escaped JSON pointer,
original string, occurrence index, decoded UTF-16 code-unit offset, reference and structural
context. Offsets are within decoded JSON strings, not byte offsets into source files.
The matching grammar recognizes uppercase legacy three/four-digit IDs and uppercase
namespaced IDs; this is not a census of every possible spelling, every repository file,
or resolved target decisions. The capture's scope and implementation limitations are
preserved in custody-v2.json and the raw output. Provider paths in v2 are portable
package-relative observations; the byte-exact v1 capture retains its original machine-local
paths. The tool records structural observations without issuing citation exemptions.

The six `ADR-014` occurrences are:

| Schema                              | JSON pointer                                                             |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `adr-validation-policy.schema.json` | `/examples/0/exception_catalog/entries/0/legacy_record/reference`        |
| `adr-validation-policy.schema.json` | `/examples/0/exception_catalog/entries/0/path`                           |
| `adr-validation-policy.schema.json` | `/examples/0/semantic_resolver/resolvable_legacy_references/0/path`      |
| `adr-validation-policy.schema.json` | `/examples/0/semantic_resolver/resolvable_legacy_references/0/reference` |
| `adr.schema.json`                   | `/examples/0/id`                                                         |
| `adr.schema.json`                   | `/examples/0/provenance/0`                                               |

These paths are under the actual root schema keyword `examples`, whose purpose is
illustrative usage under [JSON Schema 2020-12 validation, section 9.5](https://json-schema.org/draft/2020-12/json-schema-validation#name-examples).
This structural classification does not establish a DETRAN decision, authenticate an
upstream ADR or resolve the native citation finding. A schema property merely named
`examples` does not receive that classification automatically. Likewise, annotation
context for the other 96 rows does not itself prove that their textual citations are
non-normative or valid; each remains available for authority review.

All 121 schema files were observed byte-equal to their corresponding files in the
physically installed, self-declared DEVAI 2.6.3 package. Package/source paths and hashes
are recorded; `authenticatedOrigin` remains false. Equality with installed bytes does
not authenticate package publication or the referenced ADRs. The remaining tracked
`manifest.json` has no observed installed counterpart and no ADR occurrences.

The [v2 Inspector report](../../../work/rounds/R-0041/reports/schema-citation-census/inspector-review-report-v2.json)
and original streams preserve 23 passing independent fixture tests with zero skips.
The old-source counterexample run is preserved separately: 17 passed and five failed.
The original b655 implementation review returned PASS with nonblocking findings, including
a CLI symlink invocation that could silently exit successfully and missing explicit
index/worktree witnesses. Root repaired these findings in v2; the new independent delta
review remains pending. These test results are not a native verdict or resolution of
citation authority gaps. The v1 capture, review and 17-test report remain unchanged.
No provider namespace resolver or compatibility waiver has been adopted by this capture.

The archived `decision_citation_resolution` FAIL still names `ADR-014` in these two schema
files. It reported two file findings, distinct from the six concrete occurrences counted
here. Its original R-0036 reading remains unchanged. Fourteen missing round records,
R-0017's historical mutation and the prose ADR frontmatter gap also remain explicit.
The nineteen old closure-index findings require fresh registered measurement against the
current canonical index before claiming resolution. ADR-0053 belongs to the C1 closure
work and is not duplicated here. New round output may reference this inventory, while
R-0036 stays closed and its sealed bytes remain untouched.

The subsequent [independent v2 delta review](../../../work/rounds/R-0041/reports/schema-citation-census/independent-delta-review-v2.json)
returned PASS for the source, fixture tests and bounded check wiring. Its
[custody record](../../../work/rounds/R-0041/reports/schema-citation-census/independent-delta-review-custody-v2.json)
binds the reviewed hashes and original review bytes. Diagnostic reports retain their
original temporary output paths; `custody-v2.json` maps those paths to the preserved
repository copies. This source review grants no native citation verdict or historical
compatibility exemption.
