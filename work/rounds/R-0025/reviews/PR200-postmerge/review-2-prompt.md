Return ONLY a JSON object. First character { and last character }. NO Markdown fences, preamble or postscript. Keys verdict PASS/FAIL, findings array, scope.

Read-only Architect corrected-delta review. No edits/runtime/tests/generators/DB.
Do not inspect primary checkout or concurrent scorecard. Read recovered review1
and its capture limitation in work/rounds/R-0025/reviews/PR200-postmerge/.

Review corrected reports/P4-02-S1-security-prerequisite.md against A1, ADR0047
and T0 maps. Three medium fixes: protocol/admit preserve legal success unlinked
(no S1 routing409); four archive/audit files explicitly added as bounded ownership;
S1 security RED gates T2, D10/D11/claim-concurrency RED explicitly gates laterT3.
Low fixes: exact fixture/spec ownership, real suite+existing RLS check for new
tables; domain generated module registrations/handwritten indexes no app.module;
Architect docs OpenAPI generation vs Engineer code/clients; generated manifest
addition; coupled group/branch ancestry/ordered local integration then one finalPR;
validation.md exists with pending final evidence honestly stated.

Post-merge report/CI/audit facts unchanged. Audit machine timestamps preserved;
no scorecard promotion. No actual task/role dispatch now. Check material gaps,
new permission/revocation, source inconsistencies or unowned dependencies.
Report only remaining findings; review design not implementation acceptance.
