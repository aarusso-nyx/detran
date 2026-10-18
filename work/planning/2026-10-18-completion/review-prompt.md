# Independent completion-plan review

Auditor, Article7. Read-only cross-family review through CLI alias opus; do not
infer exact model/version. Do not edit, execute tests, install, start servers,
change Git, invoke evidence/state verbs, inspect primary local/scorecard work,
message anyone, browse outside this repository or initiate implementation.

Review the full staged/working-tree planning delta against main
e536e545091d9828aef2f3c5ec0c2be6f5afb56e. Read COMPLETION-PLAN.md,
docs/meta/adr/ADR-0042-completion-plan-rebaseline.md, both ADR indexes and
work/planning/2026-10-18-completion/{reconciliation.md,scope-crosswalk.md,branch-inventory.json,open-items-snapshot.json}.
Use source files/refs as needed to verify material claims: C0002/3,
AUTHORIZATION R25, steering H, Owner decision projections, ADR0033/34/35/39,
retained campaign acceptance and gate/closure records. No new implementation.

Verify:

1. One proposed completion schedule, with historical decisions/acceptance/evidence
   retained, no hidden cancellation or promotion. Status proposed and review-only
   hold explicit; P1/P2 are not accepted governance changes. Source authority wins
   over code. PEC placement and current product priority retained unless explicit
   Owner amendment; actual remaining-source questions separated from answered H.
2. Complete no-loss planning coverage of40JNY/110UC/12JW,38unstruckDT/26issues;
   overlapping populations not progress percentages. Excluded bodycam/guarda/speed
   portions directly marked. All fetched refs/historical task statuses preserved,
   R31TASK0007checkpoint despite0020complete, stacked PEC not double-counted,
   R22stopped/selective only, closed R33/open R25unchanged. Local scorecard metadata
   only; no work scheduled or inspected there.
3. Meaningful acceptance/dependencies for all app/platform/docs/parity/release
   obligations, including local TEAT-mobile vs separate production; Portal medical
   producer boundary vs later PEC UI; no circular dependency silently solved by
   a changed permission, state, default or commissioning excluded work.
4. D/Q/O boundaries do not waive existing development gates or institutional
   trust/IdP/device qualification. k6/mutation remain excluded. No declaration of
   full readiness from prior CI/preview/draft letters or non-promoting audit.
5. Documentation links/index/entry points are coherent and proposed authority is
   unambiguous. Technical gate outputs may be pending; never infer their PASS.

Report only material, source-backed correctness/omission findings. Do not demand
new business decisions or implementation in this planning-only PR. Do not reopen
unchanged architecture preferences. A source-scope ambiguity that could misroute
remaining work is actionable; style preferences are informational only.

Return ONLY raw JSON, no fences/backticks. Keys mode="planning-review",
verdict="PASS"|"REVIEW"|"FAIL", findings=[{severity:"high"|"low",file:string,
line:integer,claim:string,fix:string}], notes=[identity,scope,limits].
