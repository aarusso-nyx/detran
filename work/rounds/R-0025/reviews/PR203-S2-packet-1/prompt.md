# Read-only cross-family review — PR203 post-merge and exact S2 packet

Role: independent Architect/Inspector reviewer. This is review only, not S2 execution.
Read AGENTS.md and current files at the supplied worktree. Do not edit files,
register/dispatch tasks, run tests, contact external services or mutate Git/DB state.
The bridge alone writes your final response. Return ONLY a raw JSON object,
without Markdown fences, prefatory prose or trailing commentary.

Review the diff against HEAD (merge2df548e0) and these new files:

- work/rounds/R-0025/reports/PR203-post-merge/README.md and JSON receipts
- work/rounds/R-0025/reports/P4-02-S2-approval-packet.md
- work/rounds/R-0025/reports/P4-02-S2-owned-paths.json
- updated plan/AUTHORIZATION, COMPLETION-PLAN, BUILD-PLAN, campaign, backlog,
  rounds index and orchestration handoff projections.

Check exact claim-context/risk/claim APIs and legacy/risk rules against accepted
ADR0045–49/0052, P4-02 A1 and closed T0 contracts. Read actual source where helpful.
Look for invented permissions/constants, premature completion/approval claims,
missing owned paths/tests likely to cause scope creep, contradictory S1/S2/S3
boundaries, inaccurate receipts, unpreserved work, weakened gates and incomplete
risk/legacy/concurrency/replay acceptance. S2 deliberately backend-only; requested
Owner approval explicitly includes deferring typed UI/dossier/browser activation
to S3, while retaining all original T4–T6/journey obligations. No S2 dispatch occurs.

Exact merge audit emitted EV-ded4f5431f6737ad,YELLOW0/45/43UNKNOWN/2NA,
readiness_promoting=false. Full DETRAN main CI passed. A separate automatic signed
local-RC verifier failed missing protected tag/summary, and the full backend fallback
published a later successful required check. Do not conflate the two workflows.
This lane does not remediate scorecard sensors or change trust/CI policy.

Return JSON: {"verdict":"PASS|REVIEW|FAIL","scope":"...","findings":[{"severity":"high|medium|low|info","path":"...","detail":"...","recommendation":"..."}],"limitations":["..."]}.
Only report actionable findings supported by current files. Do not claim you ran CI.
