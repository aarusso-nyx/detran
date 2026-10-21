# P4-02-S2-ANCHOR-01 — immutable non-newest anchor recovery packet

Architect, Constitution Articles6–10/24/41. **PROPOSED, REVIEW ONLY.**
Baseline DETRAN503ac477. The current Owner request authorizes this packet and
additional independent review of it; it does **not** authorize upstream repair,
DETRAN adoption or proof mutation. Both stages below need their own concrete
approval. S2/P4/JW01/R-0025 remain OPEN; implementation merge/production/S3 remain
outside this packet. Local/scorecard/recovery work stays separate and preserved.

## 1. Observed blocker and immutable custody

Installed package and public CLI report @aarusso-nyx/devai2.6.3. `devai evidence
--help` exposes collect/record/redact/render/verify. `devai evidence record --help`
exposes --recover-newest-line, --proof-path and --proof-sequence with **newest
physical line** semantics. There is no supported public non-newest reconciliation
operation in the inspected installed release. The desired public API below is a
proposal, not an available command/flag. No speculative invocation is provided.

Normal integration preserved main's canonical chain and all eight original
R-0025 generic proof lines. Original divergent S2 chain is separately preserved.
Supported newest recovery appended line8's anchor; line7 remains
PROOF_LINE_ORPHAN. Historical-prefix truncation was refused as
PROOF_HISTORY_MODIFIED and restored byte-for-byte; do not retry that workaround.
The refused sequence7 stdout file is empty; its described stderr is a transcript,
not falsely presented as complete raw capture. Native verification remains blocked.

### Exact inputs at this packet checkpoint

| Input | SHA256 of complete bytes |
| --- | --- |
| `package.json` | `498908b1a9244e3865cff007890be351a6fd40c7ee77f77429eab2091958cb49` |
| `pnpm-lock.yaml` | `b6e26eea39b702d4983bc0e63ade9448fab65789e1d0e4ee67e99d490770cc15` |
| `record/proofs/chain.json` | `fdc8a9fd4b77500aa6388ad20ccd9f3329e057229bc1369869428a1ef2ddc5b9` |
| `record/proofs/work/generic/R-0025.jsonl` | `bd1d8b085a1aa929b689f2e4e58af93620870f9b347fc75c0c88eba3c4c85c41` |
| `work/rounds/R-0025/reports/S2-execution/CI-2026-10-21/preserved-premerge-S2-chain.json` | `46b1459576b3e51fbaf6ea1e8f3492d91c3171239fadf38bd8af78917cb36f73` |
| `work/rounds/R-0025/reports/S2-execution/CI-2026-10-21/preserved-S2-anchor-custody.json` | `f26dac97ef6a534e832f7e620ea3663eeb3c7cc2c68b80037fcaed17e79fee66` |
| `work/rounds/R-0025/reports/S2-execution/CI-2026-10-21/devai-nonnewest-anchor-blocker.md` | `e12574e2df3551527cc68425b291342e8b6faf2fec9071c0c5ec3970b2a131ad` |
| `work/rounds/R-0025/reports/S2-execution/CI-2026-10-21/recovery-sequence8.json` | `6a22bd9ea6988c19df8d6bc34dabd59569d4899b0c230217bef387c508fc27d1` |

The original divergent chain's digest is46b1459576b3e51fbaf6ea1e8f3492d91c3171239fadf38bd8af78917cb36f73.
The current epoch has eight physical newline-terminated lines. Line7 raw JSON bytes
**excluding its terminating newline** hash to
28de325bb2b82c31ce6103c4036ef70f3de284108f37810534cf5d12faea547d,
matching its original direct anchor. Its internal line_hash is
bc2a9f33f1cabffc5771c70ab940818cf1aff1cea309295c194f5f340c903360;
previous_line_hash is991953e0760586c1d8a467c002cb1c11c1bfbb2c78cd8bffc9e5ba688681c86b.
Do not conflate raw-line anchor digest with its internal line-chain hash.
Original anchor identities are:

```json
[
  {
    "id": "EV-a20749884f3d97aa",
    "proof_path": "record/proofs/work/generic/R-0025.jsonl",
    "proof_sequence": 7,
    "proof_sha256": "28de325bb2b82c31ce6103c4036ef70f3de284108f37810534cf5d12faea547d",
    "sequence": 165,
    "previous_hash": "16b9fcb0ea8dc52e93cc7bae8aa371d4a1577a71c0307cde6be920f6792b9294",
    "manifest_hash": "528006c1defb85d01b55d0a57a64d049c2ffbd77151a831deb47e72cbbf72708"
  },
  {
    "id": "EV-6a191a7e6b389f3d",
    "proof_path": "record/proofs/work/generic/R-0025.jsonl",
    "proof_sequence": 8,
    "proof_sha256": "958931109f3d1c6c061698c7343c4b1788820d5b6095b7de64d7540dd7c491cf",
    "sequence": 166,
    "previous_hash": "528006c1defb85d01b55d0a57a64d049c2ffbd77151a831deb47e72cbbf72708",
    "manifest_hash": "c8ce6a8c72b0b79e0fe5739f5f8dfbcf7c79812e9b81cb77e871f50df9fe5edf"
  }
]
```

These historical original records prove custody, not authority to splice their
old sequence/previous_hash into main. Upstream must validate the complete original
chain cryptography/manifests, exact published revision provenance, original full
epoch/prefix and both original anchor relationships. A copied JSON claiming an
anchor is insufficient. Verify the original line7 artifact manifests against the
original checkpoint, not later modified current report bytes. Freeze the selected
canonical chain HEAD/digest anew immediately before eventual execution; main may
advance legitimately after this planning snapshot.

## 2. Stage U — separately authorized upstream DEVAI change/release

Read-only source inventory actually verified under sibling
`/Volumes/Development/projects/stech/devai`:

- Architect: law/adr/ADR-EVI-0005-newest-line-recovery-cli.md and predecessor
  ADR-EVI-0002-proof-line-anchoring.md. The accepted newest-only ADR explicitly
  rejects older-line recovery. A new supplemental ADR/contract and upstream Owner
  approval must authorize the narrower custody-proved divergent-anchor case;
  never edit the accepted history or pretend this packet supersedes it.
- Engineer candidate seams: packages/evidence/src/evidence/verb-evidence.ts and
  anchors.ts; packages/cli/src/commands/evidence/facade.ts and
  facade-collect-record.ts. They were inspected read-only for the existing newest
  mode; no sibling modification is authorized here.
- Inspector candidate sensors actually present:
  packages/cli/tests/unit/cmp0006-evidence-recovery.test.ts,
  packages/cli/tests/unit/evidence-verify-anchors.test.ts and
  packages/evidence/tests/proof-line-anchoring.test.ts.

These are verified seams, not an implementation write grant. Upstream Owner must
inventory its current branch, AGENTS/path authority, locks, schemas/catalogue/help/
release machinery and exact additional files before dispatch. Any necessary schema,
chain implementation, catalogue or release path not frozen in that inventory is an
upstream ownership gate, not permission inferred from this list. This DETRAN
session never writes the sibling repository.

### Proposed supported public behavior — naming/API not yet available

Provide one reviewed public action for reconciling **one exact immutable,
non-newest proof line originally directly anchored on a verifiable divergent
published chain** into a selected canonical chain. Its final verb/options/schema
must be published by upstream; do not invent them locally or call package internals.
Inputs must bind canonical repo identity, current canonical chain expected head,
canonical proof path/physical sequence7, exact epoch/prefix/line digests and
original published chain/anchor/checkpoint provenance. Resolve canonical paths
without symlink/path escape and validate the complete newline-terminated epoch.
Require explicit role/authority/write consent through the supported harness.

Before mutation, establish:

1. Original published chain/anchor authenticity and cryptographic consistency,
   complete immutable epoch prefix/history, exact raw line digest and ownership.
2. Current line7 and prior committed epoch bytes match that custody; line8 and
   all other lines remain intact. No changed/deleted/renumbered proof is repairable.
3. Selected current canonical chain is intact, expected head matches, no conflicting
   direct anchor or accepted historical declaration covers the selected line, and
   no ambiguous original anchor/provenance exists.
4. Existing valid line8 recovery and all canonical records remain unchanged.

Then append exactly one new canonical recovery anchor through the supported
machine evidence boundary, cryptographically linked to the **current** canonical
head, binding original line7 identity/digest and original provenance. Do not copy
old chain sequence165/previous_hash as a current anchor position, fabricate a new
proof record, rerun an evidence payload, or promote the historical verdict.
Exact result schema/audit attribution are upstream Architect responsibilities.

Exact successful retry is a no-op with a verifiable existing result, never a second
anchor. Same line with conflicting provenance/digest is rejected. Concurrent same
requests converge on one append; expected-head contention must fail or revalidate
safely under the upstream contract. Crash before/after append must preserve a valid
append-only chain and retry behavior; no partially rewritten chain or lost record.
Receipt/source inputs are read-only. No wildcard repair, bulk orphan waiver or
historical-gap declaration is a substitute.

### Inspector RED before upstream Engineer; release gates

Prove the genuine eight-line divergence fixture: canonical integrated chain fails
on line7 while supported newest8 stays anchored, then one authorized public
reconciliation makes verification pass with all original bytes preserved. Add
negatives for tampered original chain/proof/prefix/line/hash/artifact manifest,
missing authentic publication custody, wrong repo/round/path/sequence, symlink/
escape, unterminated line, nonexistent/foreign line, inconsistent original anchors,
accepted historical declaration, conflicting direct anchor, revoked/missing
write authority, stale expected head and unrelated cryptographic defects. Generic
old orphans without original direct-anchor custody must still be refused.

Prove exact retry, duplicate/conflicting/concurrent requests, crash boundaries,
line8 preservation, complete prior canonical-prefix byte identity and unchanged
historical baseline. Preserve original newest-only controls and error distinctions;
no skip/timeout/gate relaxation. Upstream full affected tests, public CLI/help/schema
compatibility, independent review, exact-head required CI and separately authorized
upstream merge/release precede DETRAN adoption. No available future version is
asserted by this packet. A package tag alone is not verified repair capability.

## 3. Stage D — separately approved bounded DETRAN adoption

Prerequisites before dispatch:

- Identify the actual published immutable DEVAI version, package tarball/integrity,
  changelog/source commit, reviewed upstream decision and precise public action.
  Verify Node24/pnpm9 compatibility and all existing supported gates/chain semantics.
- Produce and review an exact package.json/pnpm-lock.yaml candidate diff, including
  every transitive change and peer dependency effect. No blanket latest/update.
- Close a version-specific adoption inventory. Current tentative ownership is
  Architect this packet plus a new scoped adoption report/approval; Engineer
  **only** root package.json and pnpm-lock.yaml for that exact release; Inspector
  new/changed adopter sensors only if their exact paths are first approved.
- Runtime `.devai/pin`/`.devai/config` rebinding is not implicitly allowed. If the
  actual release requires changed constitution/bindings/generator/config, stop for
  an exact governance adoption packet using supported registered init actions.
  No STYNX, application runtime, threshold, scorecard or CI-path waiver is bundled.

The actual repair stage has a machine-only output boundary: the selected canonical
record/proofs/chain.json may receive only the supported recovery append. The epoch
record/proofs/work/generic/R-0025.jsonl, anchor-baseline, original divergent chain,
legacy .devai/state/evidence-chain.json, historical proofs/reviews/receipts and
scorecard work remain byte-identical. Any additional required proof/state output
must be declared in the version-specific reviewed public action before execution;
no manually authored record or hidden state repair is permitted.

After Inspector demonstrates public-action RED on2.6.3 and positive/negative
behavior with the real released version in an isolated disposable fixture, Engineer
adopts exact package/lock; qualified operator invokes only the released public
reconciliation action with approved inputs/consent. Capture full argv, role,
HEAD/tree, before/after hashes, raw stdout/stderr/exit and existing-result retry.
Machine appends are committed with their producing session, never fabricated by
Architect/Engineer text editing. No production DB or application write is needed.

Required acceptance: public help/version/package integrity; package/build/lock
validation; native law/DEVAI, doctor, proof-anchor and full chain verification;
exact epoch and historical-prefix preservation; current canonical chain append
only; source snapshots refreshed only if their already-approved inputs require it;
full affected/root required CI on exact candidate and independent adoption review.
CI evidence-gate must actually pass; chain structure success alone cannot waive
other PR211 gates, exhausted delivery-review cap or incomplete source qualification.
Adoption PR/recovery merge requires separate authorization with green checks.

## 4. Current disposition and explicit stop conditions

**BLOCKED:** DEVAI2.6.3 has no supported non-newest reconciliation; line7 remains
orphan. This packet neither repairs it nor claims a new package/release exists.
Preparation plus independent packet review is the only currently authorized work.
Upstream repair, release, adoption diff and actual recovery each remain pending.

Stop on failed custody/identity/hash checks, changed epoch/history, missing upstream
Owner/path approval, unsupported public action, unreviewed dependency/config change,
ambiguous/duplicate/historically declared anchor, unexpected machine output,
nonappend-only delta, failed negative/race/CLI proof or required CI failure.
Never use manual chain edits, internal imports, package patching, temporary proof
truncation/prefix checkout, delete/recreate/reorder, a different checkout to hide
history, baseline/historical-gap expansion, waived evidence gate or invented PASS.
No scorecard/round/JW01 completion, S3, deployment or repair implementation follows.
