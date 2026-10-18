# P4-01 bounded correction review

Auditor Article7, read-only cross-family CLI alias opus, exact model not inferred.
Review work/rounds/R-0025/reports/P4-01-packet-review.md only for correction of the
six findings in work/rounds/R-0025/reviews/P4-01/review-1-recovered.json.
The first CLI output was fenced JSON, rejected by bridge; its full formatting
failure log and recovered JSON are retained. No valid bridge/PASS is claimed.

Verify WF-RAIT-004 F-DP-2/§4 and IU-RAIT-004 §6 cited as ADMITIDO claim sources,
runtime DISTRIBUIDO treated as conflict rather than proof of a missing command.
Dossier remains proposal versus IU triage; If-Match source/client/runtime conflict
explicit; errors source/runtime/unresolved including impediment; cross-actor key
reuse reconciled rather than adopted; receive body==instance excludes defense.
Verify exact packet is contract-only, named outputs, no execution authorization,
no runtime/tests/DDL/grant changes and no decision made in advance about conflicts.
User authorized preparation only: “Yes—prepare the exact P4 packet for review”.
PR195 now merged a7900301; implementation remains paused pending exactP4 approval.
No new architecture audit. No edits/tests/install/servers/Git mutations/evidence
or state verbs/external actions; do not inspect primary checkout/scorecard content.
Return ONLY a raw JSON object. Start first byte with { and end with }. Never use
Markdown fences. Keys mode="planning-review",cycle=2,verdict="PASS"|"REVIEW"|"FAIL",
findings=[{severity:"high"|"low",file:string,line:integer,claim:string,fix:string}],
notes=[identity,scope,limits]. Exact model version must not be inferred from alias.
