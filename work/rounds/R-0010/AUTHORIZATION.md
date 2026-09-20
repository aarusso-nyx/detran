---
schemaVersion: '1.0.0'
round_id: 'R-0010'
status: active
authority: Owner
decision: GRANTED
granted_at: '2026-09-16T17:25:18.000Z'
source: 'Explicit user instruction of 2026-09-16: "/goal Execute [00-maestro.md](work/rounds/R-0010/prompts/00-maestro.md) até o merge final."'
publication: true
release: false
---

# R-0010 authorization

The Owner explicitly instructed the maestro to execute the R-0010 prompt through the final merge. This record transcribes that authorization for normal pushes of `orchestra/boat-backend`, PR creation and merge after green required checks and the required review PASS, exact-SHA audit observation, and governed round closure. It does not authorize package publication, release, deployment, force-push, or mutation outside this repository.

## Owner decisions during execution

- **2026-09-19 — C-2-13/BAT boundary:** the Owner decided that the preliminary crash report may
  satisfy C-2-13 without claiming to be the official BAT. BAT and its normative fields remain
  `source_pending` under DT-061/OD-B08. This decision removes BAT fields from the blockers of the
  preliminary report; it does not by itself approve a signature profile, TSA, signer, converter,
  or informational wording.
- **2026-09-20 — Default D1:** the Owner approved the complete D1 proposal: unsigned preliminary
  report policy (`PAdES=NONE`, no TSA or gov.br), the explicit non-BAT informational notice,
  WeasyPrint as the PDF/A-2b backend, veraPDF as a mandatory fail-closed gate, and the adjustable
  technical parameters recorded in the options report. This authorizes TASK-0016/0017 to proceed.
- **2026-09-20 — reviewer exception:** while Claude is unavailable, the Owner exceptionally
  authorized the Codex family as reviewer for the remainder of this session, until the Owner
  reports Claude available again. The review remains an isolated, ephemeral, read-only Auditor
  invocation through `tools/orchestra/bridge.sh`; the rubric, cycle limits and mandatory `PASS`
  are unchanged.
- **2026-09-20 — escalated remediation:** after the authorized Codex delivery review returned
  `FAIL` with six high findings and one low finding, the Owner explicitly authorized remediation
  and a new review. Corrections are limited to those findings; commit, evidence, push and PR remain
  gated by a subsequent `PASS`.
