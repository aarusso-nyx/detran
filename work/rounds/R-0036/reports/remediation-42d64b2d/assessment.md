# R-0036 interim measurement checkpoint

Candidate: `42d64b2dff70ffb790ea13bab88279738e599040`, DEVAI 2.6.2.
This checkpoint supplements the immutable `evaluation-34a89f84` assessment.
It does not claim a new complete 43-cell evaluation.

| Measurement | Native result | Assessment |
| --- | --- | --- |
| Migration | PASS | DDL applied to disposable PostGIS, reapplied and tenant/RLS smoke checks passed. F2:T4's former command gap is resolved for this candidate. |
| Unit population | PASS | 12,094 tests passed, zero failed. This discharges the unit component of F3:T1; integration and E2E still require native readings. |
| Workspace types | FAIL | Execution timed out at the sensor's default budget. Zero parsed errors is insufficient; no product failure is inferred. Move the same command into the supported task executor and rerun. |
| Workspace lint | REVIEW | Parser root ambiguity and output overflow make the attempt incomplete. Preserve it and rerun after measurement configuration/provider correction. |

All four native readings were recorded with `sense record`; their chain records,
candidate identity, capture hashes and canonical reading paths are in
`evidence-manifest.json`. Thresholds, both N/A entries, the constitution pin and
the legacy chain retain their previous hashes. Historical records remain intact.

The unpublished DEVAI candidate separately passed doctor and discovered 361 tables,
4,103 columns and 321 foreign keys in 92 SQL files from the real DETRAN and mock
roots. These diagnostics are not promoted into the official scorecard.

A complete supplemental dependency audit took 96 seconds and returned 225,632,228
stdout bytes, with 5 critical, 15 high, 13 moderate and 4 low vulnerabilities.
The native provider attempt timed out and remains UNKNOWN. The full raw capture
is retained locally with its hash in the manifest; it is not committed because
of size. Vulnerability remediation is separate product work.

Subsequent configuration explicitly supplies each TypeScript parser's original
application root and uses the supported task executor for workspace type checking.
All seven lint parity/parser tests pass without changing any rule. CI inputs keep
the same workflow, push event, main head branch, observation window and minimum
sample. The PR-only `baseBranch` selector is omitted for push runs: GitHub's
observed push/main population has no PR base branch. This removes an unsupported
predicate without excluding jobs, cancellations differently, or relaxing thresholds.

Coverage provenance, complete monorepo discovery for the remaining partial cells,
approved performance inputs, and provider adoption remain open. The previous
counts (19 measured, 13 partial, 11 blocked) describe the previous candidate only;
they are not replaced by a mixed-commit aggregate here.
