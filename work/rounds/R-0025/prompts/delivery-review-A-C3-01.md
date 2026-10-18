# R-0025 A-C3-01 — delivery-review, cycle 1

Role: Auditor (Constitution Art.7), read-only. Reviewer family Claude through
`tools/orchestra/bridge.sh claude opus`; do not infer the exact model from alias.
Do not edit files, run tests, install, start servers, mutate Git, send messages,
or invoke governance/evidence/state verbs. Read and inspect only; hashes allowed.

Review the entire candidate against `origin/main` d871c1d4, including uncommitted
and new files. Historical preserved branch commits are included in the candidate;
main/R-0033 changes inherited by merge are not new delivery. Read AGENTS.md,
AUTHORIZATION.md, A-C3-01 in plan.md, contracts/JW01-admissibility.md, ADR-0041,
D-23 in docs/framework/arch/frontend-preview-mode.md, source blueprint/OpenAPI,
TASK-0024..0027 reports and Inspector tests before evaluating the implementation.

The Owner approved only direct admissibility: PROTOCOLADO -> triage -> three human
criteria plus engine timeliness -> existing admit/reject. Claim-next/instruction,
minuta, the complete JW-01 and complete R-0025 remain unfinished. No merge, close,
seal, proof-chain mutation or invented individual permission is authorized.
OD-R25-016/017 and local JWT/real IdP limitations must remain explicit.

Check concrete behavior and source, not just reports:

1. Canonical commands, strict bodies and generated operation-index input types;
   headers If-Match/Idempotency-Key and parent-case ETag; no generated write bypass.
2. Only PROTOCOLADO -> TRIAGEM; real deadline engine and contextual clock/zone;
   three allowed human criteria, server actor/time/fourth verdict; unique upsert.
   No invented deadlines, constants, grant, legal mapping or state transition.
3. Tenant/app-role SQL, actual existing grants, parent lock/version, transactional
   audit/outbox/replay, rollback and conflicting keys. Installed STYNX metadata
   NoIdempotent/transactional Audit must preserve existing policy/resource/action
   while avoiding outer-cache ETag loss and duplicate audit. No shared-kernel lock
   or policy grant change is permitted. Existing admit/reject guards remain.
4. UI sequential writes using current ETags, error/partial-write handling, human
   rejection reason and grounds, real guard and kit DI interceptors. Guard must
   deny unknown/403/404/5xx/offline; tenant RLS is not individual same-tenant scope.
5. D23 control read verifyCaseAccess must use real GET+ETag in production. Preview
   uses canonical fixture existence independent of presentation state, unknown IDs
   denied; the same guards remain, page reads keep all five QA scenarios. Explicit
   read classification must retain every method inventory and 65 command entries.
   Four activated preview writes log and throw unavailable without real network.
6. Tests authored before implementation; authorized legacy changes strengthen or
   source-update replaced assumptions only. Preserve all other unavailable
   commands, full old64 inventory plus additive65th, original exact policy checks,
   all zero-network/preview/a11y assertions, real HTTP/RLS/rollback/replay tests.
   Counterfactual foreign fixture is owner-only setup with live constraints; it
   proves isolation, not initial qualification or a productive foreign AIT graph.
7. Planning/status/budget claims distinguish estimates, historical results,
   expected RED, actual PASS and pending integration; machine config untouched.
   No unrelated changes or manual edits to generated files.

The maestro's broad `pnpm check` and official backend kernel are running. A result
still pending at review time is a pending release gate, not an invented PASS or a
code defect. Review code and available focused receipts; explicitly note these
pending final gates. A material implementation defect still requires REVIEW.
No findings for style preference or deferred work outside the approved slice.

Return only valid JSON:
{"mode":"delivery-review","round":"R-0025","cycle":1,
"verdict":"PASS|REVIEW|FAIL","findings":[{"severity":"high|low",
"file":"relative/path","line":1,"claim":"concrete source-backed defect",
"fix":"required correction"}],"notes":["observed reviewer identity, scope,
limits and checked results"]}.
PASS means no material defect found in this bounded candidate, not round closure.
REVIEW means remediable defect or material missing observation. FAIL means concrete
security/authority/source invention/false success or weakened sensor violation.
