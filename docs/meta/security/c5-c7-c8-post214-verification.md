# Main attestation and C5/C7/C8 source diagnosis after PR #214

Architect source assessment and Inspector observations for active R-0041.
The evaluated main commit is `68d5c2a20d9c760831a3c2d0422c2b2968b87502`,
tree `1e7dac1b3d64c637fce50b91a2a387dbdb8760cc`. This is an additive
observation; prior reports retain their original statements and timestamps.

The [baseline capsule](../../../work/rounds/R-0041/reports/post214-verification-20261021/README.md)
contains the native readings, invocation receipts, source witnesses and failures.

## Main verification

The complete remote DETRAN CI run `39642004216` passed. The original trusted-local
verifier run `39642004150` failed while binding the protected evidence reference
(HTTP 404). That failure remains in its original history. A later successful
attestation, if observed, is a new result and does not rewrite the failed run.

Two official local RC preparations failed without exporting or publishing a
bundle. The first encountered the original 30-second integration startup hook
limit. The bounded full replay passed that six-case suite but later failed one
E2E case with a socket hang-up. Both command outcomes, diagnostics and raw logs are retained. Both attempts
terminated fail-closed before completing all planned tiers; neither is a complete
successful RC population. No signature, receipt, tag or successful result is invented.

The C7 correction candidate gives the Portal test fixture ownership of one stable
loopback listener, preserves every business assertion and timeout, and removes
two consumers' duplicate listen calls. Task-v1 FAIL and revised four-file TASK-v2
PASS are both retained. The final ordinary three-file check passed 43 E2E tests;
its earlier mixed RED and partial GREEN, including a separate validation failure,
remain explicit. These working-tree checks are not a signed RC result. The cleanup
failure branch is reviewed from source but has no direct test in this packet.
The [transport capsule](../../../work/rounds/R-0041/reports/c7-transport-20261021/README.md)
preserves the actual outcomes, limitations and additive metadata correction.
A frozen correction candidate still requires the complete original RC and official
verification; a later main result must identify its actual commit/tree.

## Fresh scoped observations

Exactly the same nine sensors as the previous continuation were selected before
execution. Four returned PASS, three REVIEW and two FAIL. All valid readings,
including FAIL and REVIEW, are retained without editing their verdicts, IDs or
metrics. This is a nine-sensor observation of the named main commit, not a fresh
43-cell scorecard or an assertion of product readiness.

| Front | Sensor                    | Result |
| ----- | ------------------------- | ------ |
| C5    | spec_security_coverage    | REVIEW |
| C5    | spec_robustness_targets   | PASS   |
| C7    | harness_coherence         | REVIEW |
| C7    | harness_security          | PASS   |
| C7    | harness_idiomaticity      | REVIEW |
| C7    | docs_drift                | PASS   |
| C8    | decision_record_integrity | FAIL   |
| C8    | round_record_integrity    | FAIL   |
| C8    | archive_immutability      | PASS   |

The docs-drift PASS retains its unconfigured worktree-cap subcheck skip; it
does not establish that optional predicate.

## Source population and an additional C8 reading

A separately declared citation-resolution observation initially returned FAIL
with five finding files in the original worktree. Two were ignored site build
and mirror artifacts, outside the candidate Git tree. A clean, complete source
checkout of the exact same commit was then measured with the unchanged registered
CLI and declarations. Its citation result remains FAIL with three tracked finding
files: the two provider schema files and the historical compatibility document.
No source package was removed, no input override supplied and no threshold changed.
The generated copies remain untouched in the original worktree.

The fixed nine-sensor baseline was also repeated on that complete clean checkout.
Every verdict and metric matched its original worktree counterpart. Canonical
source results across the ten distinct sensor kinds are four PASS, three REVIEW
and three FAIL. Twenty native observations across the two populations are retained
and recorded, not twenty cells. The first worktree citation observation is kept
with its input-population limitation, rather than presented as pure Git-source
assessment. The additional source FAIL does not manufacture an exemption for
quoted or provider-owned references.

Git status alone does not establish absence of ignored artifacts. Source-only
citation measurements need an explicit source-population witness; generated
coverage/test reports required by other criteria still need their own authentic
producer and population evidence. A source-only checkout is not a substitute for
those reports or for a complete 43-cell evaluation.

## C5: source gaps remain explicit

The existing sourced PII crosswalk contains 211 known fields. Classification is
source-declared for 158 and pending for 53. Processing purpose and legal basis
are pending for all 211. Retention is pending for 73, source-declared but not
operationally validated for 134, and source-declared with indefinite-retention
review for four. These are statuses of the existing source projection, not new
legal findings, approved retention rules or a complete personal-data census.

Installed DEVAI 2.6.3 looks for the literal `INSERT INTO core.pii_map` in the
configured SQL roots. It does not consume this JSON crosswalk. Adding a dummy SQL
row would not resolve the underlying source questions. BL-0019 and BL-0020 stay
open. The next source work requires authentic purpose, legal-basis, retention and
classification references for the existing field questions; a compatible provider
representation needs its own bounded review. No permission or product behavior
changes here.

## C7: diagnosed effect-admission boundary

The workflow already contains `${{ github.workflow }}-${{ github.ref }}` and
`cancel-in-progress: true`; both are recognized by the installed parser. A
clearly labelled external diagnostic copy traced the provider's existing parsing
functions without changing the installed package or repository workflow.

The diagnostic classifies all eight DETRAN CI jobs' effects as unknown. Its first
admission failures include `NODE_AUTH_TOKEN` step environments, service metadata,
a non-root working directory and the backend job's `needs`-dependent condition.
The coherence predicate requires proved effects, so recognized concurrency
literals alone cannot satisfy it. This explains the source-level refusal path;
it is neither a security approval nor a native replacement reading. The native
REVIEW remains unchanged. Provider provenance hashes and inert diagnostic results
are retained; the modified executable copy stays outside the repository.

Next action is a separately bounded review of authentic workflow metadata and
transitive effects in the provider/source projection. Do not remove services,
credentials, required dependencies or tests to obtain PASS. The idiomaticity
REVIEW still reports no composite actions or reusable workflows; extraction
requires demonstrated repetition and preserved trust boundaries.

## C8: commit-level disposition without rewriting archives

R-0017 was first observed closed at `9790efa651a1625a091bc43329474a8151dc6016`.
Two subsequent commits touched its directory: `4f388ab1df5f9799f92299dbe00d459c8c223886`
and `e10c8e1a481079374d077dc8584858e302f9891f`, affecting six paths. They added a
CTG-SEAL evidence file and post-integration review files, inserted a status note
inside the existing plan, and appended a readiness observation. The plan change
is an internal insertion, not a byte-prefix append. These source facts do not
authorize the historical edits retroactively or cancel `ROUND_ARCHIVE_MUTATED`.
Original patches, before/after hashes and commit identities remain available.

None of the 14 missing exact `record.md` paths has a reachable historical Git
source in the inspected local references. Eleven checkpoint commits explicitly
quoted in their plans were also resolved and inspected; none contained the exact
missing record. These are bounded source searches, not inferred lifecycle events.
Their round directories do contain
1,071 tracked artifacts in total, including plans; those artifacts are not
substitute canonical records. This search does not prove that an external or
unreachable source never existed. No record, closure, signature or historical
actor is reconstructed. The legacy prose ADR also remains byte-identical and
continues to fail the frontmatter predicate.

The current round sensor reports 14 missing records and the R-0017 mutation;
it reports no unresolved closure-index finding. The older 19 closure findings
remain historical observations, without attributing their disappearance to this
change. Supplementary compatibility checks do not grant native exemptions.

## Preservation and dependencies

R-0036 through R-0039 remain closed and R-0041 remains active. Thresholds, N/A,
original seven tasks, both evidence histories, prior report bytes, existing
source policy and the immutable native-WIP archive tag are preserved. C6 and all
nine additional native producer bindings remain blocked/deferred together. No
withheld protocol review was retried or reformulated, and no blocked mechanism
was implemented or executed. The separate product backlog remains unchanged.

A full scorecard requires a separately frozen candidate and the canonical
measurement sequence; these scoped observations do not upgrade historical
43-cell counts or clear the remaining campaign dependencies.
