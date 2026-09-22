---
schemaVersion: '1.0.0'
round_id: 'R-0013'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-20T01:52:46.000Z'
source: 'Explicit user instruction of 2026-09-19: "Sync worktree com origin/main e entao execute work/rounds/R-0013/prompts/00-maestro.md"'
publication: true
release: false
---

# R-0013 authorization

The Owner explicitly authorized synchronization of the `teat-frontends` worktree with
`origin/main` and execution of the R-0013 maestro prompt through its declared boundary: normal
push of `orchestra/teat-frontends`, PR creation against `main`, merge after green CI and
cross-family PASS, exact-SHA audit observation, and governed round-close.

This record grants no package publication, release, deployment, force-push, or mutation outside
this repository. It was written by the maestro from the Owner's instruction, not by the Owner;
the Owner may revoke or amend it.

## Amendment 1 — CTG-0003 provisioning authority (2026-09-21)

The Owner explicitly approved the fail-closed actor matrix proposed after TASK-0008 attempt 1 and
authorized the A5 technical scaffolding substep required before the Inspector. The binding matrix is:

- challenge: `technical-admin` and `agency-admin`;
- key registration: STYNX principal bound to a valid challenge/device, with no staff-role shortcut;
- package issue: `agency-admin` or `field-supervisor`, with explicit tenant/agency assignment;
- package download: the authorized original issuer subject only;
- receipt: authenticated device bound to the package;
- readiness: agent bound to the device, same-agency `agency-admin`, or `technical-admin`;
- grant revocation: same-agency `agency-admin` or `technical-admin`, with an audited decision;
- reconciliation: authenticated device bound to the grant.

For these strict provisioning commands, `ADMIN`, `GESTOR_DETRAN`, `SUPORTE` and every other omitted
role receive no global or wildcard bypass. Dynamic subject/device/tenant/agency bindings remain
mandatory after the static role check.

This amendment also authorizes: a compile-only handwritten scaffold before Inspector tests; the
closed `detran_r13` full-reset flag and DDL 21 inventory correction; inclusion of fixture 29 in both
closed seed profiles; and correction of the command contract for `If-Match`, `Idempotency-Key`,
ETag, 428 and 412. It does not authorize real cryptographic choices, deployment, release or any
mutation outside this repository.

## Amendment 2 — CTG-0003 corrective cycle after delivery FAIL (2026-09-21)

After the first CTG-0003 delivery review returned `FAIL`, the Owner explicitly authorized reopening
the coupled group and correcting findings F-001 through F-011. This authorization resets the
Architect → Inspector → Engineer barrier for one additional bounded attempt and authorizes a new
independent extraordinary delivery review after all gates pass.

The correction remains constrained by Amendment 1 and the original round boundary. In particular,
it authorizes closing response schemas, JSON array shapes, final append-only privileges, dynamic
binding authorization, persisted ETag/idempotency semantics, readiness computation, domain
transactions/outbox effects, HTTP status conformance and executable P0–P6 proofs. It does not
authorize choosing production cryptographic algorithms or wire formats, using real KMS/HSM or
attestation integrations, deployment, release, force-push, or mutation outside this repository.

## Amendment 3 — CTG-0003 residual corrective cycle (2026-09-21)

After the second CTG-0003 delivery review returned `FAIL`, the Owner explicitly authorized a new
bounded corrective cycle for findings F-012 through F-016, resetting the exhausted 3/3 limit and
submitting the resulting candidate to another independent extraordinary delivery review.

The cycle is limited to package usability on download, numbering and `maximum_acts` exhaustion,
the complete normative package/agency/catalogue dependency, enrollment of a new device without a
pre-existing numbering reservation, and the persisted reconciliation prerequisite for renewal.
Amendments 1 and 2 and all original repository, cryptography, publication and release boundaries
remain in force.

## Amendment 4 — CTG-0003 final blocking-findings cycle (2026-09-21)

After the third extraordinary delivery review returned `FAIL`, the Owner explicitly authorized a
final bounded cycle aimed at completely eliminating the three remaining blocking findings and a
new independent review. The exhausted 4/4 limit is reset once for Architect → Inspector → Engineer.

The scope is closed to: separating the authenticated enrollment/issuing responsibility from grant
recipient agents while proving reservation ownership; enforcing the persisted package-to-grant
manifest digest relation on download; and reconciling every terminal obligation for a device so a
newer grant cannot hide older unreconciled history. All earlier amendments and repository,
cryptography, publication and release boundaries remain in force.
