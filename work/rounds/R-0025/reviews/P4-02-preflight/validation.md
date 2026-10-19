# P4-02 preflight validation — 2026-10-18

Architect, Article7. PR198 merged at b41d8c15 after all five required checks
passed, with exact head12baf6ad and no CI corrections. Backend-kernel and BOAT
real-document checks also passed; stack-smoke was skipped by existing CI policy.

On preflight content68ca62df, affected local checks passed: docs:kb:check
(773 artifacts/446 canonical tokens), docs:kb:publish-check (201 files),
verify:state-index (45 ADRs), verify:rounds-index and devai:doctor. docs:check
passed documentation sync, TypeScript and production build. No runtime tests,
T1 RED, generators or real HTTP acceptance were run for this documentation-only
preflight. SQL observation was BEGIN READ ONLY / ROLLBACK against an existing
isolated fixture; aggregate counts are not production qualification.

Cross-family review1 of68ca62df returned FAIL because this validation receipt
was referenced but absent. It confirmed substantive blockers and91 source hashes.
This receipt corrects the blocking omission. Low findings corrected citations,
completed policy surface grouping and separated T2 prerequisites from release
prerequisites. The default-only infraction risk field is explicitly excluded;
the unfinished triage field/class map is marked internal T0 work, with inspected
consumer fields listed, rather than made an external approval requirement.
Review captures are preserved; a corrected-delta review follows.

Primary preservation: starting local ref names remain; all three machine-config
hashes match the task-start snapshot. No primary writes/checkout/stash/reset/clean,
recovery removal or scorecard content inspection/import occurred. All91 frozen
source hashes still match reviewed head and merged main. Protected runtime/test,
generated/schema, law, state and proof paths have no diff against main. CLI-only
DEVAI doctor enforcement is not claimed to cover arbitrary host-tool writes.

Formatting and final delta review results are recorded after their actual runs.
No accepted ADR, round lifecycle or approval is silently amended. T0's source
inspection is delivered with genuine stop conditions and remaining internal field
mapping; wiring and whole-JW01 acceptance are not complete.

Full-format initially failed on review1 prompt Markdown, an authored artifact
issue. Its exact originally dispatched bytes are preserved in
reports/P4-02-review-1-original-prompt.md and verified against the immutable
review1 bridge prompt SHA256. The prompt under reviews is a formatted presentation
copy; its original receipt path therefore resolves to that presentation copy,
and the archived original is the source for reproducing the dispatched hash.
Review1 output and bridge receipt are unchanged. Corrected-delta prompt formatting
is completed before dispatch. The final stable full-format run follows review2.

Corrected-delta review2 returned PASS on frozen ba2e0b79. It verified the
missing receipt correction, original archived prompt/output hashes, role/policy
citations and separation of pre-T2 gates from release gates. Its two info notes
are applied: the triage field/class map consistently belongs before T1, and
actual final formatting is recorded after execution. This is documentation
review PASS only; exact served model version is not inferred from CLI alias.

Final stable pnpm format:check passed after review2 completed and removed its
temporary files. The only subsequent edit is this result line, checked with
targeted Prettier. git diff --check passed. Final preservation and91-source hash
checks passed; review1 archived prompt/output and review2 prompt/output SHA256
values match their immutable bridge receipts.
